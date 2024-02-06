import { sinon, expect, hFake } from '../../../../test-helper.js';
import { challengeController } from '../../../../../src/shared/application/challenges/challenge-controller.js';

describe('Unit | Controller | challenge-controller', function () {
  let sharedUsecases;
  let challengeSerializer;

  beforeEach(async function () {
    sharedUsecases = { getChallenge: sinon.stub() };
    challengeSerializer = { serialize: sinon.stub() };
  });

  describe('#get', function () {
    it('should fetch and return the given challenge, serialized as JSONAPI', async function () {
      // given
      const challengeId = 123;
      const challenge = Symbol('someChallenge');
      const expectedResult = Symbol('serialized-challenge');
      sharedUsecases.getChallenge.resolves(challenge);
      challengeSerializer.serialize.resolves(expectedResult);

      // when
      const response = await challengeController.get({ params: { id: challengeId } }, hFake, {
        sharedUsecases,
        challengeSerializer,
      });

      // then
      expect(sharedUsecases.getChallenge).to.have.been.calledWith({ challengeId });
      expect(challengeSerializer.serialize).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });
});
