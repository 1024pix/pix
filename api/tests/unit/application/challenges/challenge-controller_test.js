const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const ChallengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const ChallengeSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/challenge-serializer');

describe('Unit | Controller | challenge-controller', function() {

  let server;
  let ChallengeRepoStub;
  let ChallengeSerializerStub;

  beforeEach(function() {
    ChallengeRepoStub = sinon.stub(ChallengeRepository, 'get');
    ChallengeSerializerStub = sinon.stub(ChallengeSerializer, 'serialize');
    server = Hapi.server();

    return server.register(require('../../../../lib/application/challenges'));
  });

  describe('#get', function() {

    const challenge = Symbol('someChallenge');

    it('should fetch and return the given challenge, serialized as JSONAPI', async () => {
      // given
      ChallengeRepoStub.resolves(challenge);
      ChallengeSerializerStub.resolves({ serialized: challenge });

      // when
      const response = await server.inject({ method: 'GET', url: '/api/challenges/challenge_id' });

      // then
      expect(response.result).to.deep.equal({ serialized: challenge });
    });
  });
});
