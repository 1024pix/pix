import { ChallengeDeneutralized } from '../../../../lib/domain/events/ChallengeDeneutralized.js';
import { ChallengeNeutralized } from '../../../../lib/domain/events/ChallengeNeutralized.js';
import { _forTestOnly } from '../../../../lib/domain/events/index.js';
import { expect } from '../../../test-helper.js';
import { buildEventDispatcherAndHandlersForTest } from '../../../tooling/events/event-dispatcher-builder.js';

describe('Event Choreography | Rescore Certification', function () {
  it('Should trigger Certification Rescoring handler on ChallengeNeutralized event', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest(_forTestOnly);
    const event = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleCertificationRescoring).to.have.been.calledWithExactly({
      domainTransaction: undefined,
      event,
    });
  });

  it('Should trigger Certification Rescoring handler on ChallengeDeneutralized event', async function () {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest(_forTestOnly);
    const event = new ChallengeDeneutralized({ certificationCourseId: 1, juryId: 7 });

    // when
    await eventDispatcher.dispatch(event);

    // then
    expect(handlerStubs.handleCertificationRescoring).to.have.been.calledWithExactly({
      domainTransaction: undefined,
      event,
    });
  });
});
