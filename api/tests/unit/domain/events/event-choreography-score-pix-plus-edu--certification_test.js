const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');
const CertificationRescoringCompleted = require('../../../../lib/domain/events/CertificationRescoringCompleted');

describe('Event Choreography | Score Pix+ Édu Certification', function () {
  it('chains Certification Scoring and Pix+ Édu Certification Scoring on Certification Scoring Completed', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();

    const domainTransaction = Symbol('a transaction');
    const assessmentCompleted = new AssessmentCompleted();
    const certificationScoringCompleted = new CertificationScoringCompleted({});

    handlerStubs.handleCertificationScoring
      .withArgs({ event: assessmentCompleted, domainTransaction })
      .resolves(certificationScoringCompleted);

    // when
    await eventDispatcher.dispatch(certificationScoringCompleted);

    // then
    expect(handlerStubs.handlePixPlusEduCertificationsScoring).to.have.been.calledWith({
      event: certificationScoringCompleted,
      domainTransaction: undefined,
    });
  });

  it('chains Certification Rescoring and Pix+ Édu Certification Rescoring on Certification Rescoring Completed', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();

    const domainTransaction = Symbol('a transaction');
    const assessmentCompleted = new AssessmentCompleted();
    const certificationRescoringCompleted = new CertificationRescoringCompleted({});

    handlerStubs.handleCertificationRescoring
      .withArgs({ event: assessmentCompleted, domainTransaction })
      .resolves(certificationRescoringCompleted);

    // when
    await eventDispatcher.dispatch(certificationRescoringCompleted);

    // then
    expect(handlerStubs.handlePixPlusEduCertificationsScoring).to.have.been.calledWith({
      event: certificationRescoringCompleted,
      domainTransaction: undefined,
    });
  });
});
