import { CertificationRescoringCompleted } from '../../../../lib/domain/events/CertificationRescoringCompleted.js';
import { expect } from '../../../test-helper.js';
import { buildEventDispatcherAndHandlersForTest } from '../../../tooling/events/event-dispatcher-builder.js';

describe('Event Choreography | Score Pix+ Certification', function () {
  it('chains Certification Rescoring and Pix+ Certification Rescoring on Certification Rescoring Completed', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const certificationRescoringCompleted = new CertificationRescoringCompleted({});

    // when
    await eventDispatcher.dispatch(certificationRescoringCompleted);

    // then
    expect(handlerStubs.handleComplementaryCertificationsScoring).to.have.been.calledWithExactly({
      event: certificationRescoringCompleted,
      domainTransaction: undefined,
    });
  });
});
