const { describe, it, after, before, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | assessment-controller-get-solutions', () => {

  before(() => {
    return knex.migrate.latest()
      .then(() => {
        return knex.seed.run();
      })
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
              '\u00c9preuves': [
                'q_third_challenge',
                'q_second_challenge',
                'q_first_challenge',
              ],
            },
          }
          );
        nock('https://api.airtable.com')
          .get('/v0/test-base/Epreuves/q_first_challenge')
          .query(true)
          .times(2)
          .reply(200, {
            'id': 'q_first_challenge',
            'fields': {
              'acquis': ['web3'],
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
              'acquis': ['web2'],
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
              'acquis': ['web1'],
              'Bonnes réponses': 'dromadaire'
            },
          }
          );
      });
  });

  after((done) => {
    nock.cleanAll();
    server.stop(done);
  });

  afterEach(() => {
    return knex('assessments').delete()
      .then(() => {
        return knex('answers').delete();
      });
  });

  describe('(non-adaptive end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', () => {

    //assessment
    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    const insertedAssessment = {
      courseId: 'non_adaptive_course_id'
    };

    beforeEach(() => {
      return knex('assessments').insert([ insertedAssessment ])
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

          return knex('answers').insert([ inserted_answer_1, inserted_answer_2 ]);
        })
        .then((rows) => {
          insertedAnswerId = rows[0];
        });
    });

    it('should return the solution if the user answered every challenge', () => {
      // Given
      const options = {
        method: 'GET',
        url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId
      };
      const expectedSolution = {
        type: 'solutions',
        id: 'q_second_challenge',
        attributes: { value: 'truite' }
      };

      // When
      const promise = server.injectThen(options);

      // Then
      return promise.then((response) => {
        expect(response.result.data).to.deep.equal(expectedSolution);
      });
    });
  });

  describe('(non-adaptive not end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', () => {

    //assessment
    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    const insertedAssessment = {
      courseId: 'non_adaptive_course_id'
    };

    beforeEach(() => {
      return knex('assessments').insert([ insertedAssessment ]).then((rows) => {
        insertedAssessmentId = rows[0];

        const inserted_answer = {
          value: 'any bad answer',
          result: 'ko',
          challengeId: 'q_first_challenge',
          assessmentId: insertedAssessmentId
        };

        return knex('answers').insert([ inserted_answer ]);
      })
        .then((rows) => {
          insertedAnswerId = rows[0];
        });
    });

    it('should return null if the adaptive test is not over', () => {
      // Given
      const options = {
        method: 'GET',
        url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId
      };

      // When
      const promise = server.inject(options);

      // Then
      return promise.then((response) => {
        expect(response.result).to.equal('null');
      });
    });
  });

  describe('(adaptive end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', () => {

    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    const insertedAssessment = {
      courseId: 'adaptive_course_id'
    };

    beforeEach(() => {
      return knex('assessments')
        .insert([ insertedAssessment ])
        .then((rows) => {

          insertedAssessmentId = rows[0];

          const inserted_answer = {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'q_first_challenge',
            assessmentId: insertedAssessmentId
          };

          return knex('answers').insert([ inserted_answer ]);
        }).then((rows) => {
          insertedAnswerId = rows[0];
        });
    });

    it('should return a solution if user completed the adaptive test', () => {
      const options = {
        method: 'GET',
        url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId
      };
      const expectedSolution = {
        type: 'solutions',
        id: 'q_first_challenge',
        attributes: { value: 'fromage' }
      };

      // When
      const promise = server.injectThen(options);

      // Then
      return promise.then((response) => {
        expect(response.result.data).to.deep.equal(expectedSolution);
      });
    });
  });

  describe('(adaptive not end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', () => {

    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    const insertedAssessment = {
      courseId: 'adaptive_course_id'
    };

    const insertedScenario = {
      courseId: 'adaptive_course_id',
      path: 'ok',
      nextChallengeId: 'q_second_challenge'
    };

    beforeEach(() => {
      return knex('assessments').insert([ insertedAssessment ])
        .then((rows) => {
          insertedAssessmentId = rows[0];

          const inserted_answer = {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'q_first_challenge',
            assessmentId: insertedAssessmentId
          };

          return knex('answers').insert([ inserted_answer ]);
        }).then((rows) => {
          insertedAnswerId = rows[0];

          return knex('scenarios').insert([ insertedScenario ]);
        });
    });

    afterEach(() => {
      return knex('scenarios').delete();
    });

    it('should return null if user did not complete the adaptive test', () => {
      // Given
      const options = {
        method: 'GET',
        url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId
      };

      // When
      const promise = server.injectThen(options);

      // Then
      return promise.then((response) => {
        expect(response.result).to.equal('null');
      });
    });
  });

});
