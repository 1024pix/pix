const { expect, knex, nock, generateValidRequestAuhorizationHeader } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/cache');
const server = require('../../../server');

describe('Acceptance | API | assessment-controller-get-solutions', () => {

  before(() => {
    return knex.migrate.latest()
      .then(() => {
        nock('https://api.airtable.com')
          .get('/v0/test-base/Tests/non_adaptive_course_id')  // XXX cf. issue #204, there may be a conflict with course-controller_test
          .query(true)
          .times(4)
          .reply(200, {
            'id': 'non_adaptive_course_id',
            'fields': {
              // a bunch of fields
              'Adaptatif ?': false,
              'Competence': ['competence_id'],
              '\u00c9preuves': [
                'q_second_challenge',
                'q_first_challenge',
              ],
            },
          }
          );
        nock('https://api.airtable.com')
          .get('/v0/test-base/Tests/adaptive_course_id')
          .query(true)
          .times(4)
          .reply(200, {
            'id': 'adaptive_course_id',
            'fields': {
              // a bunch of fields
              'Adaptatif ?': true,
              'Competence': ['competence_id'],
              '\u00c9preuves': [
                'q_third_challenge',
                'q_second_challenge',
                'q_first_challenge',
              ],
            },
          }
          );
        nock('https://api.airtable.com')
          .get('/v0/test-base/Competences/competence_id')
          .query(true)
          .reply(200, {
            'id': 'competence_id',
            'fields': {
              'Référence': 'challenge-view',
              'Titre': 'Mener une recherche et une veille d\'information',
              'Sous-domaine': '1.1',
              'Domaine': '1. Information et données',
              'Statut': 'validé',
              'Acquis': ['@web1']
            }
          });
        nock('https://api.airtable.com')
          .get('/v0/test-base/Epreuves')
          .query({ view: 'challenge-view' })
          .times(3)
          .reply(200, {
            'records': [
              {
                'id': 'q_first_challenge',
                'fields': {
                  'Statut': 'validé',
                  'competences': ['competence_id'],
                  'acquis': ['@web3']
                }
              },
              {
                'id': 'q_second_challenge',
                'fields': {
                  'Statut': 'validé',
                  'competences': ['competence_id'],
                  'acquis': ['@web2']
                },
              },
              {
                'id': 'q_third_challenge',
                'fields': {
                  'Statut': 'validé',
                  'competences': ['competence_id'],
                  'acquis': ['@web1']
                },
              }
            ]
          });
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
              'Bonnes réponses': 'fromage'
            },
          }
          );

        nock('https://api.airtable.com')
          .get('/v0/test-base/Epreuves/q_second_challenge')
          .query(true)
          .times(2)
          .reply(200, {
            'id': 'q_second_challenge',
            'fields': {
              'acquis': ['@web2'],
              'Statut': 'validé',
              'Bonnes réponses': 'truite'
            },
          }
          );
        nock('https://api.airtable.com')
          .get('/v0/test-base/Epreuves/q_third_challenge')
          .query(true)
          .times(1)
          .reply(200, {
            'id': 'q_third_challenge',
            'fields': {
              'acquis': ['@web1'],
              'Statut': 'validé',
              'Bonnes réponses': 'dromadaire'
            },
          }
          );
      });
  });

  after(() => {
    nock.cleanAll();
    cache.flushAll();
  });

  afterEach(() => {
    return knex('assessments').delete();
  });

  describe('(non-adaptive end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', () => {

    //assessment
    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    const insertedAssessment = {
      courseId: 'non_adaptive_course_id',
      estimatedLevel: 0,
      pixScore: 5
    };

    beforeEach(() => {
      return knex('assessments').insert([insertedAssessment])
        .then((rows) => {
          insertedAssessmentId = rows[0];

          const inserted_answer_1 = {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'q_first_challenge',
            assessmentId: insertedAssessmentId
          };

          const inserted_answer_2 = {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'q_second_challenge',
            assessmentId: insertedAssessmentId
          };

          return knex('answers').insert([inserted_answer_1, inserted_answer_2]);
        })
        .then((rows) => {
          insertedAnswerId = rows[0];
        });
    });

    it('should return the solution if the user answered every challenge', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId,
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };
      const expectedSolution = {
        type: 'solutions',
        id: 'q_second_challenge',
        attributes: { value: 'truite' }
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.result.data).to.deep.equal(expectedSolution);
      });
    });

    it('should return 200 HTTP status code when missing authorization header', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId,
        headers: {},
      };

      // when
      const promise = server.inject(options);

      // given
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('(non-adaptive not end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', () => {

    //assessment
    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    const notCompletedAssessment = {
      courseId: 'non_adaptive_course_id'
    };

    beforeEach(() => {
      return knex('assessments').insert([notCompletedAssessment]).then((rows) => {
        insertedAssessmentId = rows[0];

        const inserted_answer = {
          value: 'any bad answer',
          result: 'ko',
          challengeId: 'q_first_challenge',
          assessmentId: insertedAssessmentId
        };

        return knex('answers').insert([inserted_answer]);
      })
        .then((rows) => {
          insertedAnswerId = rows[0];
        });
    });

    it('should return null if the adaptive test is not over', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId,
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(409);
        expect(response.result).to.deep.equal({
          'error': 'Conflict',
          'message': 'Cette évaluation n\'est pas terminée.',
          'statusCode': 409
        });
      });
    });
  });

  describe('(adaptive end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', () => {

    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    const completedAssessment = {
      courseId: 'adaptive_course_id',
      estimatedLevel: 1,
      pixScore: 9
    };

    beforeEach(() => {
      return knex('assessments')
        .insert([completedAssessment])
        .then((rows) => {

          insertedAssessmentId = rows[0];

          const inserted_answer = {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'q_first_challenge',
            assessmentId: insertedAssessmentId
          };

          return knex('answers').insert([inserted_answer]);
        }).then((rows) => {
          insertedAnswerId = rows[0];
        });
    });

    // FIXME
    it('should return a solution if user completed the adaptive test', () => {
      const options = {
        method: 'GET',
        url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId,
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };
      const expectedSolution = {
        type: 'solutions',
        id: 'q_first_challenge',
        attributes: { value: 'fromage' }
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.result.data).to.deep.equal(expectedSolution);
      });
    });
  });

  describe('(adaptive not end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', () => {

    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    const notCompletedAssessment = {
      courseId: 'adaptive_course_id'
    };

    beforeEach(() => {
      return knex('assessments').insert([notCompletedAssessment])
        .then((rows) => {
          insertedAssessmentId = rows[0];

          const inserted_answer = {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'q_first_challenge',
            assessmentId: insertedAssessmentId
          };

          return knex('answers').insert([inserted_answer]);
        }).then((rows) => {
          insertedAnswerId = rows[0];

        });
    });

    it('should return null if user did not complete the adaptive test', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId,
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(409);
        expect(response.result).to.deep.equal({
          'error': 'Conflict',
          'message': 'Cette évaluation n\'est pas terminée.',
          'statusCode': 409
        });
      });
    });
  });

});
