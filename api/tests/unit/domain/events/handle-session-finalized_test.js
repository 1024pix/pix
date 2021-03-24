const { catchErr, expect, domainBuilder, sinon } = require('../../../test-helper');
const handleFinalizedSession = require('../../../../lib/domain/events/handle-session-finalized');
const JuryCertificationSummary = require('../../../../lib/domain/read-models/JuryCertificationSummary');
const { status: assessmentResultStatuses } = require('../../../../lib/domain/models/AssessmentResult');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');
const SessionFinalized = require('../../../../lib/domain/events/SessionFinalized');
const FinalizedSession = require('../../../../lib/domain/models/FinalizedSession');

describe('Unit | Domain | Events | handle-session-finalized', function() {

  const juryCertificationSummaryRepository = { findBySessionId: sinon.stub() };
  const finalizedSessionRepository = { save: sinon.stub() };

  const dependencies = {
    juryCertificationSummaryRepository,
    finalizedSessionRepository,
  };

  it('fails when event is not of correct type', async function() {
    // given
    const event = 'not an event of the correct type';

    // when
    const error = await catchErr(handleFinalizedSession)(
      { event, ...dependencies },
    );

    // then
    expect(error).not.to.be.null;
  });

  it('saves a finalized session', async function() {
    // given
    const event = new SessionFinalized({
      sessionId: 1234,
      finalizedAt: new Date(),
      hasExaminerGlobalComment: false,
      certificationCenterName: 'A certification center name',
      sessionDate: '2021-01-29',
      sessionTime: '14:00',
    });
    juryCertificationSummaryRepository.findBySessionId.withArgs(1234).resolves(
      [
        new JuryCertificationSummary({
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
              category: CertificationIssueReportCategories.LATE_OR_LEAVING,
              subcategory: CertificationIssueReportSubcategories.SIGNATURE_ISSUE,
            }),
          ],
        }),
      ],
    );
    finalizedSessionRepository.save.resolves();

    // when
    await handleFinalizedSession({ event, ...dependencies });

    // then
    expect(finalizedSessionRepository.save).to.have.been.calledWithExactly(
      new FinalizedSession({
        sessionId: event.sessionId,
        finalizedAt: event.finalizedAt,
        certificationCenterName: event.certificationCenterName,
        sessionDate: event.sessionDate,
        sessionTime: event.sessionTime,
        isPublishable: true,
        publishedAt: null,
      }),
    );
  });
});
