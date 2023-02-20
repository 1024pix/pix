import { expect, HttpTestServer, sinon } from '../../../test-helper';
import ChallengeRepository from '../../../../lib/infrastructure/repositories/challenge-repository';
import ChallengeSerializer from '../../../../lib/infrastructure/serializers/jsonapi/challenge-serializer';
import moduleUnderTest from '../../../../lib/application/challenges';

describe('Unit | Controller | challenge-controller', function () {
  let httpTestServer;

  let ChallengeRepoStub;
  let ChallengeSerializerStub;

  beforeEach(async function () {
    ChallengeRepoStub = sinon.stub(ChallengeRepository, 'get');
    ChallengeSerializerStub = sinon.stub(ChallengeSerializer, 'serialize');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('#get', function () {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const challenge = Symbol('someChallenge');

    it('should fetch and return the given challenge, serialized as JSONAPI', async function () {
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
