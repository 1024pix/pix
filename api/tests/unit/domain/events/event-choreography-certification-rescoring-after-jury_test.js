import { expect } from '../../../test-helper';
import buildEventDispatcherAndHandlersForTest from '../../../tooling/events/event-dispatcher-builder';
import CertificationJuryDone from '../../../../lib/domain/events/CertificationJuryDone';

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
