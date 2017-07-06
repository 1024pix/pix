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
                'second_challenge',
                'first_challenge',
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
                'third_challenge',
                'second_challenge',
                'first_challenge',
              ],
            },
          }
          );
        nock('https://api.airtable.com')
          .get('/v0/test-base/Epreuves/first_challenge')
          .query(true)
          .times(3)
          .reply(200, {
            'id': 'first_challenge',
            'fields': {
              'Bonnes réponses': 'fromage'
            },
          }
          );
        nock('https://api.airtable.com')
          .get('/v0/test-base/Epreuves/second_challenge')
          .query(true)
          .reply(200, {
            'id': 'second_challenge',
            'fields': {
              'Bonnes réponses': 'truite'
            },
          }
          );
        nock('https://api.airtable.com')
          .get('/v0/test-base/Epreuves/third_challenge')
          .query(true)
          .reply(200, {
            'id': 'third_challenge',
            'fields': {
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
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'non_adaptive_course_id'
    };

    beforeEach(() => {
      return knex('assessments').insert([ insertedAssessment ])
        .then((rows) => {
          insertedAssessmentId = rows[0];

          const inserted_answer_1 = {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'first_challenge',
            assessmentId: insertedAssessmentId
          };

          const inserted_answer_2 = {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'second_challenge',
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
        id: 'second_challenge',
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
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'non_adaptive_course_id'
    };

    beforeEach(() => {
      return knex('assessments').insert([ insertedAssessment ]).then((rows) => {
        insertedAssessmentId = rows[0];

        const inserted_answer = {
          value: 'any bad answer',
          result: 'ko',
          challengeId: 'first_challenge',
          assessmentId: insertedAssessmentId
        };

        return knex('answers').insert([ inserted_answer ]);
      })
        .then((rows) => {
          insertedAnswerId = rows[0];
        });
    });

    it('should return null if user did not answer every challenge', () => {
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
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'adaptive_course_id'
    };

    beforeEach(() => {
      return knex('assessments')
        .insert([ insertedAssessment ])
        .then((rows) => {

          insertedAssessmentId = rows[0];

          const inserted_answer = {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'first_challenge',
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
        id: 'first_challenge',
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
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'adaptive_course_id'
    };

    const insertedScenario = {
      courseId: 'adaptive_course_id',
      path: 'ok',
      nextChallengeId: 'second_challenge'
    };

    beforeEach(() => {
      return knex('assessments').insert([ insertedAssessment ])
        .then((rows) => {
          insertedAssessmentId = rows[0];

          const inserted_answer = {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'first_challenge',
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
