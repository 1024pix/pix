const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const Challenge = require('../../../../lib/domain/models/Challenge');
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

    it('should fetch and return all the challenges, serialized as JSONAPI', () => {
      // given
      sinon.stub(ChallengeRepository, 'list').resolves(challenges);
      sinon.stub(ChallengeSerializer, 'serialize').callsFake(_ => challenges);

      // when
      return server.inject({ method: 'GET', url: '/api/challenges' })
        .then(res => {

        // then
          expect(res.result).to.deep.equal(challenges);

          // after
          ChallengeRepository.list.restore();
          ChallengeSerializer.serialize.restore();
        });
    });
  });

  describe('#get', function() {

    const challenge = new Challenge({ 'id': 'challenge_id' });

    it('should fetch and return the given challenge, serialized as JSONAPI', () => {
      // given
      sinon.stub(ChallengeRepository, 'get').resolves(challenge);
      sinon.stub(ChallengeSerializer, 'serialize').callsFake(_ => challenge);

      // when
      return server.inject({ method: 'GET', url: '/api/challenges/challenge_id' })
        .then(res => {
          // then
          expect(res.result).to.deep.equal(challenge);

          // after
          ChallengeRepository.get.restore();
          ChallengeSerializer.serialize.restore();
        });
    });

    it('should reply with error status code 404 if challenge not found', () => {
      // given
      const error = {
        'error': {
          'type': 'MODEL_ID_NOT_FOUND',
          'message': 'Could not find row by id unknown_id'
        }
      };
      sinon.stub(ChallengeRepository, 'get').rejects(error);

      // when
      return server.inject({ method: 'GET', url: '/api/challenges/unknown_id' })
        .then(res => {
          // then
          expect(res.statusCode).to.equal(404);

          // after
          ChallengeRepository.get.restore();
        });
    });
  });

  describe('#refreshSolution', function() {

    it('should refresh all the given challenge solutions', () => {
      // given
      const solution = new Solution({
        id: 1,
        type: 'solution_type',
        value: 'solution_yaml_solution',
        scoring: 'solution_scoring'
      });
      sinon.stub(SolutionRepository, 'refresh').resolves(solution);

      // when
      return server.inject({ method: 'POST', url: '/api/challenges/challenge_id/solution' })
        .then(res => {
          // then
          expect(res.result).to.equal('ok');
          sinon.assert.calledOnce(SolutionRepository.refresh);

          // after
          SolutionRepository.refresh.restore();
        });
    });

  });
});
