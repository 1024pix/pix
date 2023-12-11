import { catchErr, expect, domainBuilder, sinon } from '../../../test-helper.js';
import { handleSessionFinalized as handleFinalizedSession } from '../../../../lib/domain/events/handle-session-finalized.js';
import { JuryCertificationSummary } from '../../../../lib/domain/read-models/JuryCertificationSummary.js';
import { status as assessmentResultStatuses } from '../../../../src/shared/domain/models/AssessmentResult.js';
import { AutoJuryDone } from '../../../../lib/domain/events/AutoJuryDone.js';
import { FinalizedSession } from '../../../../lib/domain/models/FinalizedSession.js';

const juryCertificationSummaryRepository = { findBySessionId: sinon.stub() };
const finalizedSessionRepository = { save: sinon.stub() };
const supervisorAccessRepository = { sessionHasSupervisorAccess: sinon.stub() };
const dependencies = {
  juryCertificationSummaryRepository,
  finalizedSessionRepository,
  supervisorAccessRepository,
};

describe('Unit | Domain | Events | handle-session-finalized', function () {
  it('fails when event is not of correct type', async function () {
    // given
    const event = 'not an event of the correct type';

    // when
    const error = await catchErr(handleFinalizedSession)({ event, ...dependencies });

    // then
    expect(error).not.to.be.null;
  });

  it('saves a finalized session', async function () {
    // given
    const event = new AutoJuryDone({
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
    juryCertificationSummaryRepository.findBySessionId.withArgs(1234).resolves([juryCertificationSummary]);
    finalizedSessionRepository.save.resolves();
    supervisorAccessRepository.sessionHasSupervisorAccess.resolves(true);
    const finalizedSessionFromSpy = sinon.spy(FinalizedSession, 'from');

    // when
    await handleFinalizedSession({ event, ...dependencies });

    // then
    expect(supervisorAccessRepository.sessionHasSupervisorAccess).to.have.been.calledOnceWithExactly({
      sessionId: 1234,
    });
    expect(finalizedSessionFromSpy).to.have.been.calledOnceWithExactly({
      sessionId: event.sessionId,
      finalizedAt: event.finalizedAt,
      certificationCenterName: event.certificationCenterName,
      sessionDate: event.sessionDate,
      sessionTime: event.sessionTime,
      hasExaminerGlobalComment: false,
      hasSupervisorAccess: true,
      juryCertificationSummaries: [juryCertificationSummary],
    });
    expect(finalizedSessionRepository.save).to.have.been.calledWithExactly(
      new FinalizedSession({
        sessionId: event.sessionId,
        finalizedAt: event.finalizedAt,
        certificationCenterName: event.certificationCenterName,
        sessionDate: event.sessionDate,
        sessionTime: event.sessionTime,
        isPublishable: true,
        hasSupervisorAccess: true,
        publishedAt: null,
      }),
    );
  });
});
