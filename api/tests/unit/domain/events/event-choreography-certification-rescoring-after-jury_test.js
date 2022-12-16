const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const CertificationJuryDone = require('../../../../lib/domain/events/CertificationJuryDone');

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
