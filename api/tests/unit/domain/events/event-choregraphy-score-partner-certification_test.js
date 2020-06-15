const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const AssessmentCompleted = require('../../../../lib/domain/events/AssessmentCompleted');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');

describe('Event Choregraphy | Score Partner Certification', function() {
  it('chains Certification Scoring and Partner Certification Scoring on Assessment Completed', async () => {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();

    const domainTransaction = Symbol('a transaction');

    const assessmentCompleted = new AssessmentCompleted();
    const certificationScoringCompleted = new CertificationScoringCompleted({});

    handlerStubs.handleCertificationScoring.withArgs({ domainTransaction, event:assessmentCompleted }).resolves(
      certificationScoringCompleted
    );

    // when
    await eventDispatcher.dispatch(domainTransaction, assessmentCompleted);

    // then
    expect(handlerStubs.handlePartnerCertifications).to.have.been.calledWith({ domainTransaction, event:certificationScoringCompleted });
  });
});
