const { describe, it, after, before, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | Solutions of Assessments', function () {

  before(function (done) {
    knex.migrate.latest().then(() => {
      knex.seed.run().then(() => {
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
        done();
      });
    });
  });

  after(function (done) {
    nock.cleanAll();
    server.stop(done);
  });

  describe('(non-adaptive end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', function () {

    //assessment
    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    const insertedAssessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'non_adaptive_course_id'
    };

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([insertedAssessment]).then((rows) => {
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
          knex('answers').delete().then(() => {
            knex('answers').insert([inserted_answer_1, inserted_answer_2]).then((rows) => {
              insertedAnswerId = rows[0];
              done();
            });
          });
        });
      });
    });

    afterEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('answers').delete().then(() => {
          done();
        });
      });
    });

    it('should return the solution if the user answered every challenge', function (done) {

      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId};
      server.inject(options, (response) => {
        const expectedSolution = {
          type: 'solutions',
          id: 'second_challenge',
          attributes: { value: 'truite' }
        };
        const solution = response.result.data;
        expect(solution).to.deep.equal(expectedSolution);
        done();
      });
    });
  });

  describe('(non-adaptive not end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', function () {

    //assessment
    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    const insertedAssessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'non_adaptive_course_id'
    };

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([insertedAssessment]).then((rows) => {
          insertedAssessmentId = rows[0];

          const inserted_answer = {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'first_challenge',
            assessmentId: insertedAssessmentId
          };
          knex('answers').delete().then(() => {
            knex('answers').insert([inserted_answer]).then((rows) => {
              insertedAnswerId = rows[0];
              done();
            });
          });
        });
      });
    });

    afterEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('answers').delete().then(() => {
          done();
        });
      });
    });

    it('should return null if user did not answer every challenge', function (done) {

      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId };
      server.inject(options, (response) => {
        expect(response.result).to.equal('null');
        done();
      });
    });
  });

  describe('(adaptive end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', function () {

    let insertedAssessmentId = null;
    let insertedAnswerId = null;

    const insertedAssessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'adaptive_course_id'
    };

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([insertedAssessment]).then((rows) => {
          insertedAssessmentId = rows[0];

          const inserted_answer = {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'first_challenge',
            assessmentId: insertedAssessmentId
          };
          knex('answers').delete().then(() => {
            knex('answers').insert([inserted_answer]).then((rows) => {
              insertedAnswerId = rows[0];
              done();
            });
          });
        });
      });
    });

    afterEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('answers').delete().then(() => {
          done();
        });
      });
    });

    it('should return a solution if user completed the adaptive test', function (done) {

      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId };
      server.inject(options, (response) => {
        const expectedSolution = {
          type: 'solutions',
          id: 'first_challenge',
          attributes: { value: 'fromage' }
        };
        const solution = response.result.data;
        expect(solution).to.deep.equal(expectedSolution);
        done();
      });
    });
  });

  describe('(adaptive not end of test) GET /api/assessments/:assessment_id/solutions/:answer_id', function () {

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

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([insertedAssessment]).then((rows) => {
          insertedAssessmentId = rows[0];

          const inserted_answer = {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'first_challenge',
            assessmentId: insertedAssessmentId
          };
          knex('answers').delete().then(() => {
            knex('answers').insert([inserted_answer]).then((rows) => {
              insertedAnswerId = rows[0];

              knex('scenarios').delete().then(() => {
                knex('scenarios').insert([insertedScenario]).then(() => {
                  done();
                });
              });
            });
          });
        });
      });
    });

    afterEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('answers').delete().then(() => {
          knex('scenarios').delete().then(() => {
            done();
          });
        });
      });
    });

    it('should return null if user did not complete the adaptive test', function (done) {

      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/solutions/' + insertedAnswerId };
      server.inject(options, (response) => {
        expect(response.result).to.equal('null');
        done();
      });
    });
  });

});
