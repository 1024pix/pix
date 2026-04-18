import { challengeController } from '../../../../../src/shared/application/challenges/challenge-controller.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | challenge-controller', function () {
  let challengeToPlayApi;

  beforeEach(async function () {
    challengeToPlayApi = { get: sinon.stub(), serialize: sinon.stub() };
  });

  describe('#get', function () {
    it('should fetch and return the given challenge, serialized as JSONAPI', async function () {
      // given
      const challengeId = 123;
      const challenge = Symbol('someChallenge');
      const expectedResult = Symbol('serialized-challenge');
      challengeToPlayApi.get.resolves(challenge);
      challengeToPlayApi.serialize.returns(expectedResult);

      // when
      const response = await challengeController.get({ params: { id: challengeId } }, hFake, {
        challengeToPlayApi,
      });

      // then
      expect(challengeToPlayApi.get).to.have.been.calledWithExactly(challengeId);
      expect(challengeToPlayApi.serialize).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });
});
