import { AutoJuryDone } from '../../../../../../src/certification/session-management/domain/events/AutoJuryDone.js';
import { FinalizedSession } from '../../../../../../src/certification/session-management/domain/models/FinalizedSession.js';
import { JuryCertificationSummary } from '../../../../../../src/certification/session-management/domain/read-models/JuryCertificationSummary.js';
import { registerPublishableSession } from '../../../../../../src/certification/session-management/domain/usecases/register-publishable-session.js';
import { status as assessmentResultStatuses } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

const juryCertificationSummaryRepository = { findBySessionId: sinon.stub() };
const finalizedSessionRepository = { save: sinon.stub() };
const supervisorAccessRepository = { sessionHasSupervisorAccess: sinon.stub() };
const dependencies = {
  juryCertificationSummaryRepository,
  finalizedSessionRepository,
  supervisorAccessRepository,
};

describe('Unit | UseCase |  register-publishable-session', function () {
  it('saves a finalized session', async function () {
    // given
    const autoJuryDone = new AutoJuryDone({
      sessionId: 1234,
      finalizedAt: new Date(),
      hasExaminerGlobalComment: false,
      certificationCenterName: 'A certification center name',
      sessionDate: '2021-01-29',
      sessionTime: '14:00',
    });
    const juryCertificationSummary = new JuryCertificationSummary({
      id: 1,
      firstName: 'firstName',
      lastName: 'lastName',
      status: assessmentResultStatuses.VALIDATED,
      pixScore: 120,
      createdAt: new Date(),
      completedAt: new Date(),
      isPublished: false,
      hasSeenEndTestScreen: true,
      cleaCertificationStatus: 'not_passed',
      certificationIssueReports: [
        domainBuilder.buildCertificationIssueReport({
          category: 'NON_IMPACTFUL_CATEGORY',
          subcategory: 'NON_IMPACTFUL_SUBCATEGORY',
        }),
      ],
    });
    juryCertificationSummaryRepository.findBySessionId
      .withArgs({ sessionId: 1234 })
      .resolves([juryCertificationSummary]);
    finalizedSessionRepository.save.resolves();
    supervisorAccessRepository.sessionHasSupervisorAccess.resolves(true);
    const finalizedSessionFromSpy = sinon.spy(FinalizedSession, 'from');

    // when
    await registerPublishableSession({ autoJuryDone, ...dependencies });

    // then
    expect(supervisorAccessRepository.sessionHasSupervisorAccess).to.have.been.calledOnceWithExactly({
      sessionId: 1234,
    });
    expect(finalizedSessionFromSpy).to.have.been.calledOnceWithExactly({
      sessionId: autoJuryDone.sessionId,
      finalizedAt: autoJuryDone.finalizedAt,
      certificationCenterName: autoJuryDone.certificationCenterName,
      sessionDate: autoJuryDone.sessionDate,
      sessionTime: autoJuryDone.sessionTime,
      hasExaminerGlobalComment: false,
      hasSupervisorAccess: true,
      juryCertificationSummaries: [juryCertificationSummary],
    });
    expect(finalizedSessionRepository.save).to.have.been.calledWithExactly({
      finalizedSession: new FinalizedSession({
        sessionId: autoJuryDone.sessionId,
        finalizedAt: autoJuryDone.finalizedAt,
        certificationCenterName: autoJuryDone.certificationCenterName,
        sessionDate: autoJuryDone.sessionDate,
        sessionTime: autoJuryDone.sessionTime,
        isPublishable: true,
        hasSupervisorAccess: true,
        publishedAt: null,
      }),
    });
  });
});
