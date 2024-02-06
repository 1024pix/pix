import { sinon, expect, hFake } from '../../../../test-helper.js';
import { challengeController } from '../../../../../src/shared/application/challenges/challenge-controller.js';

describe('Unit | Controller | challenge-controller', function () {
  let challenge;
  let serializedChallenge;

  let sharedUsecases;
  let challengeSerializer;

  beforeEach(async function () {
    challenge = Symbol('challenge');
    serializedChallenge = Symbol('serializedChallenge');

    sharedUsecases = { getChallenge: sinon.stub().resolves(challenge) };
    challengeSerializer = { serialize: sinon.stub().resolves(serializedChallenge) };
  });

  describe('#get', function () {
    it('should fetch and return the given challenge, serialized as JSONAPI', async function () {
      // given
      const challengeId = 'challenge123';

      // when
      const response = await challengeController.get({ params: { id: challengeId } }, hFake, {
        sharedUsecases,
        challengeSerializer,
      });

      // then
      expect(sharedUsecases.getChallenge).to.have.been.calledOnceWith({ challengeId, assessmentId: undefined });
      expect(challengeSerializer.serialize).to.have.been.calledOnceWith(challenge);
      expect(response).to.equal(serializedChallenge);
    });

    describe('when assessmentId query param is given', function () {
      it('should forward it to the usecase', async function () {
        // given
        const challengeId = 'challenge123';
        const assessmentId = 203582;

        // when
        await challengeController.get({ params: { id: challengeId }, query: { assessmentId } }, hFake, {
          sharedUsecases,
          challengeSerializer,
        });

        // then
        expect(sharedUsecases.getChallenge).to.have.been.calledOnceWith({ challengeId, assessmentId });
      });
    });
  });
});
