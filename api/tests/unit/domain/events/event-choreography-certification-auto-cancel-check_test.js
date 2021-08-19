const { expect } = require('../../../test-helper');
const buildEventDispatcherAndHandlersForTest = require('../../../tooling/events/event-dispatcher-builder');
const ChallengeNeutralized = require('../../../../lib/domain/events/ChallengeNeutralized');
const ChallengeDeneutralized = require('../../../../lib/domain/events/ChallengeDeneutralized');
const CertificationJuryDone = require('../../../../lib/domain/events/CertificationJuryDone');

describe('Event Choreography | Certification auto cancel check', function() {

  it('Should trigger handleCertificationAutoCancelCheck on ChallengeNeutralized event', async function() {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleCertificationAutoCancelCheck).to.have.been.calledWith({ event, domainTransaction: undefined });
  });

  it('Should trigger handleCertificationAutoCancelCheck on ChallengeDeneutralized event', async function() {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new ChallengeDeneutralized({ certificationCourseId: 1, juryId: 7 });

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleCertificationAutoCancelCheck).to.have.been.calledWith({ event, domainTransaction: undefined });
  });

  it('Should trigger handleCertificationAutoCancelCheck on CertificationJuryDone event', async function() {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();
    const event = new CertificationJuryDone({ certificationCourseId: 1 });

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleCertificationAutoCancelCheck).to.have.been.calledWith({ event, domainTransaction: undefined });
  });

});
