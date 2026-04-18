import { challengeController } from '../../../../../src/shared/application/challenges/challenge-controller.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | challenge-controller', function () {
  let challengeToPlayRepository;
  let challengeSerializer;

  beforeEach(async function () {
    challengeToPlayRepository = { get: sinon.stub() };
    challengeSerializer = { serialize: sinon.stub() };
  });

  describe('#get', function () {
    it('should fetch and return the given challenge, serialized as JSONAPI', async function () {
      // given
      const challengeId = 123;
      const challenge = Symbol('someChallenge');
      const expectedResult = Symbol('serialized-challenge');
      challengeToPlayRepository.get.resolves(challenge);
      challengeSerializer.serialize.resolves(expectedResult);

      // when
      const response = await challengeController.get({ params: { id: challengeId } }, hFake, {
        challengeToPlayRepository,
        challengeSerializer,
      });

      // then
      expect(challengeToPlayRepository.get).to.have.been.calledWithExactly(challengeId);
      expect(challengeSerializer.serialize).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });
});
