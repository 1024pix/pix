const { sinon, expect, hFake } = require('../../../test-helper');

const challengeController = require('../../../../lib/application/challenges/challenge-controller');

describe('Unit | Controller | challenge-controller', function () {
  let challengeRepository;
  let challengeSerializer;

  beforeEach(async function () {
    challengeRepository = { get: sinon.stub() };
    challengeSerializer = { serialize: sinon.stub() };
  });

  describe('#get', function () {
    it('should fetch and return the given challenge, serialized as JSONAPI', async function () {
      // given
      const challengeId = 123;
      const challenge = Symbol('someChallenge');
      const expectedResult = Symbol('serialized-challenge');
      challengeRepository.get.resolves(challenge);
      challengeSerializer.serialize.resolves(expectedResult);

      // when
      const response = await challengeController.get({ params: { id: challengeId } }, hFake, {
        challengeRepository,
        challengeSerializer,
      });

      // then
      expect(challengeRepository.get).to.have.been.calledWith(challengeId);
      expect(challengeSerializer.serialize).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });
});
