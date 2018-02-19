const { expect, knex, nock } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/cache');
const server = require('../../../server');

describe('Acceptance | API | assessment-controller-get-adaptive-correct', () => {

  before((done) => {

    nock.cleanAll();

    nock('https://api.airtable.com')
      .get('/v0/test-base/Tests/w_adaptive_course_id')
      .query(true)
      .times(4)
      .reply(200, {
        'id': 'w_adaptive_course_id',
        'fields': {
          'Adaptatif ?': true,
          'Competence': ['competence_id']
        }
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Competences/competence_id')
      .query(true)
      .reply(200, {
        'id': 'competence_id',
        'fields': {
          'Référence': '1.1 Mener une recherche et une veille d’information',
          'Titre': 'Mener une recherche et une veille d’information',
          'Sous-domaine': '1.1',
          'Domaine': '1. Information et données',
          'Statut': 'validé',
          'Acquis': ['@web1']
        }
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves')
      .query({ view: '1.1 Mener une recherche et une veille d’information' })
      .reply(200, {
        'records': [
          {
            'id': 'w_first_challenge',
            'fields': {
              'Statut': 'validé',
              'competences': ['competence_id'],
              'acquis': ['@web2']
            }
          },
          {
            'id': 'w_second_challenge',
            'fields': {
              'Statut': 'validé',
              'competences': ['competence_id'],
              'acquis': ['@web3']
            },
          },
          {
            'id': 'w_third_challenge',
            'fields': {
              'Statut': 'validé',
              'competences': ['competence_id'],
              'acquis': ['@web1']
            },
          }
        ]
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/w_first_challenge')
      .query(true)
      .reply(200, {
        'id': 'w_first_challenge',
        'fields': {
          'competences': ['competence_id'],
          'Statut': 'validé',
          'acquis': ['@web2']
        }
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/w_second_challenge')
      .query(true)
      .reply(200, {
        'id': 'w_second_challenge',
        'fields': {
          'competences': ['competence_id'],
          'Statut': 'validé',
          'acquis': ['@web3']
        }
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/w_third_challenge')
      .query(true)
      .reply(200, {
        'id': 'w_third_challenge',
        'fields': {
          'competences': ['competence_id'],
          'Statut': 'validé',
          'acquis': ['@web1']
        }
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Acquis')
      .query({
        filterByFormula: 'FIND(\'1.1\', {Compétence})'
      })
      .reply(200, {
        'id': 'idAcquix'
      });

    done();
  });

  after((done) => {
    nock.cleanAll();
    cache.flushAll();
    server.stop(done);
  });

  describe('(adaptive correct answer) GET /api/assessments/:assessment_id/next/:current_challenge_id', () => {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      courseId: 'w_adaptive_course_id'
    };

    beforeEach(() => {
      return knex('assessments').insert([insertedAssessment])
        .then((rows) => {
          insertedAssessmentId = rows[0];

          return {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'w_first_challenge',
            assessmentId: insertedAssessmentId
          };
        })
        .then((inserted_answer) => {
          return knex('answers').insert([inserted_answer]);
        });
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should return the second challenge if the first answer is correct', () => {
      // given
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/w_first_challenge' };

      // when
      const request = server.injectThen(options);

      // then
      return request.then((response) => {
        expect(response.result.data.id).to.equal('w_second_challenge');
      });
    });
  });

  describe('(adaptive incorrect answer) GET /api/assessments/:assessment_id/next/:current_challenge_id', function() {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      courseId: 'w_adaptive_course_id'
    };

    beforeEach(() => {
      return knex('assessments').insert([insertedAssessment])
        .then((rows) => {
          insertedAssessmentId = rows[0];

          return {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'w_first_challenge',
            assessmentId: insertedAssessmentId
          };
        })
        .then((inserted_answer) => {
          return knex('answers').insert([inserted_answer]);
        });
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should return the third challenge if the first answer is incorrect', () => {
      // given
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/w_first_challenge' };

      // when
      const request = server.injectThen(options);

      // then
      return request.then((response) => {
        expect(response.result.data.id).to.equal('w_third_challenge');
      });
    });
  });

  describe('(end of adaptive test) GET /api/assessments/:assessment_id/next/:current_challenge_id', () => {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      courseId: 'w_adaptive_course_id'
    };

    beforeEach(() => {
      return knex('assessments').insert([insertedAssessment])
        .then((rows) => {
          insertedAssessmentId = rows[0];

          return [{
            value: 'any good answer',
            result: 'ok',
            challengeId: 'w_first_challenge',
            assessmentId: insertedAssessmentId
          }, {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'w_second_challenge',
            assessmentId: insertedAssessmentId
          }];
        })
        .then((insertedAnswers) => {
          return knex('answers').insert(insertedAnswers);
        });
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should finish the test if there is no next challenge', () => {
      // given
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/w_second_challenge' };

      // when
      const promise = server.injectThen(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
        expect(response.result).to.deep.equal({
          error: 'Not Found',
          message: 'Not Found',
          statusCode: 404
        });
      });
    });
  });

})
;
