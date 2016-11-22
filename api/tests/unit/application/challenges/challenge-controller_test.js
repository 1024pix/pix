const Hapi = require('hapi');
const Challenge = require('../../../../lib/domain/models/referential/challenge');
const ChallengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const ChallengeSerializer = require('../../../../lib/infrastructure/serializers/challenge-serializer');

describe('Unit | Controller | ChallengeController', function () {

  let server;

  before(function () {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/challenges') });
  });

  describe('#list', function () {

    const challenges = [
      new Challenge({ "id": "challenge_1" }),
      new Challenge({ "id": "challenge_2" }),
      new Challenge({ "id": "challenge_3" })
    ];

    it('should fetch and return all the challenges, serialized as JSONAPI', function (done) {
      // given
      sinon.stub(ChallengeRepository, 'list').resolves(challenges);
      sinon.stub(ChallengeSerializer, 'serializeArray', _ => challenges);

      // when
      server.inject({ method: 'GET', url: '/api/challenges' }, (res) => {

        // then
        expect(res.result).to.deep.equal(challenges);

        // after
        ChallengeRepository.list.restore();
        ChallengeSerializer.serializeArray.restore();
        done();
      });
    });
  });

  describe('#get', function () {

    const challenge = new Challenge({ "id": "challenge_id" });

    it('should fetch and return the given challenge, serialized as JSONAPI', function (done) {
      // given
      sinon.stub(ChallengeRepository, 'get').resolves(challenge);
      sinon.stub(ChallengeSerializer, 'serialize', _ => challenge);

      // when
      server.inject({ method: 'GET', url: '/api/challenges/challenge_id' }, (res) => {

        // then
        expect(res.result).to.deep.equal(challenge);

        // after
        ChallengeRepository.get.restore();
        ChallengeSerializer.serialize.restore();
        done();
      });
    });

    it('should reply with error status code 404 if challenge not found', function (done) {
      // given
      const error = {
        "error": {
          "type": "MODEL_ID_NOT_FOUND",
          "message": "Could not find row by id unknown_id"
        }
      };
      sinon.stub(ChallengeRepository, 'get').rejects(error);

      // when
      server.inject({ method: 'GET', url: '/api/challenges/unknown_id' }, (res) => {

        // then
        expect(res.statusCode).to.equal(404);

        // after
        ChallengeRepository.get.restore();
        done();
      });
    });
  });

});
