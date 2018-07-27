const { expect, knex, nock } = require('../../../test-helper');
const server = require('../../../../server');
const cache = require('../../../../lib/infrastructure/caches/cache');

describe('Acceptance | Controller | correction-controller', () => {

  describe('GET /api/corrections', function() {

    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    before(() => {
      nock('https://api.airtable.com')
        .get('/v0/test-base/Epreuves/q_first_challenge')
        .query(true)
        .times(2)
        .reply(200, {
          'id': 'q_first_challenge',
          'fields': {
            'Statut': 'validé',
            'competences': ['competence_id'],
            'acquis': ['@web3'],
            'Bonnes réponses': 'fromage',
            'Acquix': ['q_first_acquis']
          }
        });
      nock('https://api.airtable.com')
        .get('/v0/test-base/Acquis/q_first_acquis')
        .query(true)
        .times(2)
        .reply(200, {
          'id': 'q_first_acquis',
          'fields': {
            'Nom': '@web3',
            'Indice': 'Indice web3',
            'Statut de l\'indice': 'Validé'
          }
        });
    });

    after(() => {
      nock.cleanAll();
      cache.flushAll();
    });

    beforeEach(() => {
      const completedAssessment = {
        courseId: 'adaptive_course_id',
        state: 'completed'
      };
      return knex('assessments')
        .insert(completedAssessment).returning('id')
        .then(([id]) => {
          insertedAssessmentId = id;

          const inserted_answer = {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'q_first_challenge',
            assessmentId: insertedAssessmentId
          };

          return knex('answers').insert(inserted_answer).returning('id');
        }).then(([id]) => insertedAnswerId = id);
    });

    afterEach(() => {
      return knex('answers').delete()
        .then(() => knex('assessments').delete());
    });

    it('should not necessitate auth and return 200 HTTP status with a solution, a hint, an array of tutorial and a learning more array', () => {
      // given
      const options = {
        method: 'GET',
        url: `/api/corrections?answerId=${insertedAnswerId}`
      };
      const expectedBody = {
        'data': [{
          'attributes': {
            'solution': 'fromage',
            'hint': 'Indice web3',
          },
          'relationships': {
            'tutorials': {
              'data': [],
            },
            'learning-more-tutorials': {
              'data': [],
            }
          },
          'id': 'q_first_challenge',
          'type': 'corrections',
        }]
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedBody);
      });
    });
  });
});
