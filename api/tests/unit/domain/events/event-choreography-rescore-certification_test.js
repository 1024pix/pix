const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const CertificationAutoCancelCheckDone = require('../../../../lib/domain/events/CertificationAutoCancelCheckDone');

describe('Event Choreography | Certification rescoring', function() {

  it('Should trigger handleCertificationRescoring on CertificationAutoCancelCheckDone event', async function() {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new CertificationAutoCancelCheckDone({ certificationCourseId: 1, juryId: 7, commentForJury: '' });

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleCertificationRescoring).to.have.been.calledWith({ domainTransaction: undefined, event });
  });
});
