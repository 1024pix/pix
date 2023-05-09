import { expect } from '../../../test-helper.js';
import { buildEventDispatcherAndHandlersForTest } from '../../../tooling/events/event-dispatcher-builder.js';
import { CertificationJuryDone } from '../../../../lib/domain/events/CertificationJuryDone.js';

describe('Event Choreography | CertificationJuryDone', function () {
  it('Should trigger the certification rescoring', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new CertificationJuryDone({});

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleCertificationRescoring).to.have.been.calledWith({ event, domainTransaction: undefined });
  });
});
