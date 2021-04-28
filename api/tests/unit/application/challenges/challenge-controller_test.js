const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const ChallengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const ChallengeSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/challenge-serializer');

const moduleUnderTest = require('../../../../lib/application/challenges');

describe('Unit | Controller | challenge-controller', function() {

  let httpTestServer;

  let ChallengeRepoStub;
  let ChallengeSerializerStub;

  beforeEach(async function() {
    ChallengeRepoStub = sinon.stub(ChallengeRepository, 'get');
    ChallengeSerializerStub = sinon.stub(ChallengeSerializer, 'serialize');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('#get', function() {

    const challenge = Symbol('someChallenge');

    it('should fetch and return the given challenge, serialized as JSONAPI', async () => {
      // given
      ChallengeRepoStub.resolves(challenge);
      ChallengeSerializerStub.resolves({ serialized: challenge });

      // when
      const response = await httpTestServer.request('GET', '/api/challenges/challenge_id');

      // then
      expect(response.result).to.deep.equal({ serialized: challenge });
    });
  });
});
