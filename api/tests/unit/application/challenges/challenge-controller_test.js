const { describe, it, before, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const Challenge = require('../../../../lib/domain/models/referential/challenge');
const ChallengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const ChallengeSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/challenge-serializer');
const Solution = require('../../../../lib/domain/models/referential/solution');
const SolutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');

describe('Unit | Controller | challenge-controller', function() {

  let server;

  before(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/challenges') });
  });

  describe('#list', function() {

    const challenges = [
      new Challenge({ 'id': 'challenge_1' }),
      new Challenge({ 'id': 'challenge_2' }),
      new Challenge({ 'id': 'challenge_3' })
    ];

    it('should fetch and return all the challenges, serialized as JSONAPI', function(done) {
      // given
      sinon.stub(ChallengeRepository, 'list').resolves(challenges);
      sinon.stub(ChallengeSerializer, 'serializeArray').callsFake(_ => challenges);

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

  describe('#get', function() {

    const challenge = new Challenge({ 'id': 'challenge_id' });

    it('should fetch and return the given challenge, serialized as JSONAPI', function(done) {
      // given
      sinon.stub(ChallengeRepository, 'get').resolves(challenge);
      sinon.stub(ChallengeSerializer, 'serialize').callsFake(_ => challenge);

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

    it('should reply with error status code 404 if challenge not found', function(done) {
      // given
      const error = {
        'error': {
          'type': 'MODEL_ID_NOT_FOUND',
          'message': 'Could not find row by id unknown_id'
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

  describe('#refreshSolution', function() {

    it('should refresh all the given challenge solutions', function(done) {
      // given
      const solution = new Solution({
        id: 1,
        type: 'solution_type',
        value: 'solution_yaml_solution',
        scoring: 'solution_scoring'
      });
      sinon.stub(SolutionRepository, 'refresh').resolves(solution);

      // when
      server.inject({ method: 'POST', url: '/api/challenges/challenge_id/solution' }, (res) => {

        // then
        expect(res.result).to.equal('ok');
        sinon.assert.calledOnce(SolutionRepository.refresh);

        // after
        SolutionRepository.refresh.restore();
        done();
      });
    });

  });
});
