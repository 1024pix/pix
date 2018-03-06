const { expect, knex, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const Answer = require('../../../../lib/infrastructure/data/answer');
const solutionRepository = require('../../../../lib/infrastructure/repositories/solution-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const solutionService = require('../../../../lib/domain/services/solution-service');

describe('Unit | Controller | answer-controller', function() {

  let server;

  before(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/answers') });
  });

  function executeRequest(payload, callback) {
    server.inject({ method: 'POST', url: '/api/answers', payload }, (res) => {
      callback(res);
    });
  }

  const jsonAnswer = {
    'data': {
      'attributes': {
        'value': 'NumA = "4", NumB = "1", NumC = "3", NumD = "2"',
        'result': null,
        'timeout': null
      },
      'relationships': {
        'assessment': {
          'data': {
            'type': 'assessments',
            'id': 12
          }
        },
        'challenge': {
          'data': {
            'type': 'challenges',
            'id': 'recdTpx4c0kPPDTtf'
          }
        }
      },
      'type': 'answers'
    }
  };

  const persistedAnswer = new Answer({
    id: '1234',
    value: '2',
    result: 'ok',
    resultDetails: 'NumA: true\nNumB: true\nNumC: true\nNumD: true\n',
    assessmentId: 12,
    challengeId: 'recdTpx4c0kPPDTtf',
    timeout: null
  });

  afterEach(() => {
    return knex('answers').delete();
  });

  describe('#save', function() {

    it('should return a successful response with HTTP code 201 when answer was created', function(done) {
      // given
      sinon.stub(answerRepository, 'findByChallengeAndAssessment').resolves(null);
      sinon.stub(solutionRepository, 'get').resolves(null);
      sinon.stub(solutionService, 'validate').returns({ result : 'ok', resultDetails : { NumA : true, NumB : true, NumC : true, NumD : true } });

      // when
      executeRequest(jsonAnswer, (res) => {
        // then
        expect(res.statusCode).to.equal(201);

        // after
        answerRepository.findByChallengeAndAssessment.restore();
        solutionRepository.get.restore();
        solutionService.validate.restore();
        done();
      });
    });

    it('should return the field "resultDetails"', function(done) {
      // given
      sinon.stub(solutionRepository, 'get').resolves(null);
      sinon.stub(solutionService, 'validate').returns({ result : 'ok', resultDetails : { NumA : true, NumB : true, NumC : true, NumD : true } });

      // when
      executeRequest(jsonAnswer, (res) => {
        // then
        expect(res.result.data.attributes['result-details']).to.equal(persistedAnswer.get('resultDetails'));

        // after
        solutionRepository.get.restore();
        solutionService.validate.restore();
        done();
      });
    });
  });
});

