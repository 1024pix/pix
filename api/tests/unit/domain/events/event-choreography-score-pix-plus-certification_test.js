import { expect } from '../../../test-helper.js';
import { buildEventDispatcherAndHandlersForTest } from '../../../tooling/events/event-dispatcher-builder.js';
import { AssessmentCompleted } from '../../../../lib/domain/events/AssessmentCompleted.js';
import { CertificationScoringCompleted } from '../../../../lib/domain/events/CertificationScoringCompleted.js';
import { CertificationRescoringCompleted } from '../../../../lib/domain/events/CertificationRescoringCompleted.js';

describe('Event Choreography | Score Pix+ Certification', function () {
  it('chains Certification Scoring and Pix+ Certification Scoring on Certification Scoring Completed', async function () {
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
    expect(handlerStubs.handleComplementaryCertificationsScoring).to.have.been.calledWith({
      event: certificationScoringCompleted,
      domainTransaction: undefined,
    });
  });

  it('chains Certification Rescoring and Pix+ Certification Rescoring on Certification Rescoring Completed', async function () {
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
    expect(handlerStubs.handleComplementaryCertificationsScoring).to.have.been.calledWith({
      event: certificationRescoringCompleted,
      domainTransaction: undefined,
    });
  });
});
