const { describe, it, after, before, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');
const Assessment = require('../../../lib/domain/models/data/assessment');

describe('Acceptance | API | Assessments', function () {


  before(function (done) {
    knex.migrate.latest().then(() => {
      knex.seed.run().then(() => {
        nock('https://api.airtable.com')
          .get('/v0/test-base/Tests/non_adaptive_course_id')  // XXX cf. issue #204, there may be a conflict with course-controller_test
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
          .reply(200, {
            'id': 'second_challenge',
            'fields': {
              'Bonnes réponses': 'truite'
            },
          }
          );
        nock('https://api.airtable.com')
          .get('/v0/test-base/Epreuves/third_challenge')
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
    knex('scenarios').delete().then(() => {
      server.stop(done);
    });
  });

  describe('GET /api/assessments/:id', function () {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId:'anyFromAirTable'
    };

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([insertedAssessment]).then((rows) => {
          insertedAssessmentId = rows[0];
          done();
        });
      });
    });

    afterEach(function (done) {
      knex('assessments').delete().then(() => {done();});
    });

    it('should return 200 HTTP status code', function (done) {

      knex.select('id')
      .from('assessments')
      .limit(1)
      .then(function() {
        server.inject({ method: 'GET', url: `/api/assessments/${insertedAssessmentId}` }, (response) => {
          expect(response.statusCode).to.equal(200);
          done();
        });
      });

    });


    it('should return application/json', function (done) {

      knex.select('id')
      .from('assessments')
      .limit(1)
      .then(function() {
        server.inject({ method: 'GET', url: `/api/assessments/${insertedAssessmentId}` }, (response) => {
          const contentType = response.headers['content-type'];
          expect(contentType).to.contain('application/json');
          done();
        });
      });

    });


    it('should return the expected assessment', function (done) {
      // XXX: incomplete test, should also demonstrate that it returns the whole answer grape.
      // See https://github.com/sgmap/pix/issues/205
      knex.select('id')
      .from('assessments')
      .limit(1)
      .then(function() {
        server.inject({ method: 'GET', url: `/api/assessments/${insertedAssessmentId}` }, (response) => {
          const expectedAssessment = {
            'type':'assessment',
            'id': insertedAssessmentId,
            'attributes':
            {
              'user-name':'John Doe',
              'user-email':'john.doe@mailmail.com'
            },
            'relationships':
            {'course':
            {'data':{'type':'courses','id':'anyFromAirTable'}},
              'answers':{'data':[]}
            }
          };
          const assessment = response.result.data;
          expect(assessment).to.deep.equal(expectedAssessment);
          done();
        });
      });

    });


  });

  describe('POST /api/assessments', function () {

    afterEach(function (done) {
      knex('assessments').delete().then(() => {done();});
    });

    const options = {
      method: 'POST', url: '/api/assessments', payload: {
        data: {
          type: 'assessment',
          attributes: {
            'user-name': 'Jon Snow',
            'user-email': 'jsnow@winterfell.got'
          },
          relationships: {
            course: {
              data: {
                type: 'course',
                id: 'non_adaptive_course_id'
              }
            }
          }
        }
      }
    };

    it('should return 201 HTTP status code', function (done) {
      server.inject(options, (response) => {
        expect(response.statusCode).to.equal(201);
        done();
      });
    });

    it('should return application/json', function (done) {
      server.inject(options, (response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should add a new assessment into the database', function (done) {
      // given
      Assessment.count().then(function (beforeAssessmentsNumber) {
        // when
        server.inject(options, () => {
          Assessment.count().then(function (afterAssessmentsNumber) {
            // then
            expect(afterAssessmentsNumber).to.equal(beforeAssessmentsNumber + 1);
            done();
          });
        });
      });
    });

    it('should persist the given course ID and user ID', function (done) {

      // when
      server.inject(options, (response) => {

        new Assessment({ id: response.result.data.id })
        .fetch()
        .then(function (model) {
          expect(model.get('courseId')).to.equal(options.payload.data.relationships.course.data.id);
          expect(model.get('userName')).to.equal(options.payload.data.attributes['user-name']);
          expect(model.get('userEmail')).to.equal(options.payload.data.attributes['user-email']);
          done();
        });

      });
    });

    it('should return persisted assessement', function (done) {

      // when
      server.inject(options, (response) => {
        const assessment = response.result.data;

        // then
        expect(assessment.id).to.exist;
        expect(assessment.attributes['user-id']).to.equal(options.payload.data.attributes['user-id']);
        expect(assessment.attributes['user-name']).to.equal(options.payload.data.attributes['user-name']);
        expect(assessment.attributes['user-email']).to.equal(options.payload.data.attributes['user-email']);
        expect(assessment.relationships.course.data.id).to.equal(options.payload.data.relationships.course.data.id);

        done();
      });
    });

  });

  describe('(non-adaptive) GET /api/assessments/:assessment_id/next', function () {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'non_adaptive_course_id'
    };

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([insertedAssessment]).then((rows) => {
          insertedAssessmentId = rows[0];
          done();
        });
      });
    });

    afterEach(function (done) {
      knex('assessments').delete().then(() => {done();});
    });

    it('should return 200 HTTP status code', function (done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };
      server.inject(options, (response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function (done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };
      server.inject(options, (response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should return the first challenge if no challenge specified', function (done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };
      server.inject(options, (response) => {
        expect(response.result.data.id).to.equal('first_challenge');
        done();
      });
    });

    it('should return the next challenge otherwise', function (done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/first_challenge' };
      server.inject(options, (response) => {
        expect(response.result.data.id).to.equal('second_challenge');
        done();
      });
    });

    it('should return null if reached the last challenge of the course', function (done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/second_challenge' };
      server.inject(options, (response) => {
        expect(response.result).to.equal('null');
        done();
      });
    });

    it('should return null if reached the last challenge of the course', function (done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/second_challenge' };
      server.inject(options, (response) => {
        expect(response.result).to.equal('null');
        done();
      });
    });

  });

  describe('(adaptive) GET /api/assessments/:assessment_id/next', function () {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'adaptive_course_id'
    };

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([insertedAssessment]).then((rows) => {
          insertedAssessmentId = rows[0];
          done();
        });
      });
    });

    afterEach(function (done) {
      knex('assessments').delete().then(() => {done();});
    });

    it('should return 200 HTTP status code', function (done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };
      server.inject(options, (response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function (done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };
      server.inject(options, (response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should return the first challenge if no challenge specified', function (done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };
      server.inject(options, (response) => {
        expect(response.result.data.id).to.equal('first_challenge');
        done();
      });
    });

  });

  describe('(adaptive correct answer) GET /api/assessments/:assessment_id/next/:current_challenge_id', function () {

    //assessment
    let insertedAssessmentId = null;

    const insertedAssessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'adaptive_course_id'
    };

    const insertedScenarios = [{
      courseId: 'adaptive_course_id',
      path: 'ok',
      nextChallengeId: 'second_challenge'
    }, {
      courseId: 'adaptive_course_id',
      path: 'ko',
      nextChallengeId: 'third_challenge'
    }];

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([insertedAssessment]).then((rows) => {
          insertedAssessmentId = rows[0];

          const inserted_answer = {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'anyChallengeIdFromAirtable',
            assessmentId: insertedAssessmentId
          };

          knex('answers').delete().then(() => {
            knex('answers').insert([inserted_answer]).then(() => {

              knex('scenarios').delete().then(() => {
                knex('scenarios').insert(insertedScenarios).then(() => {
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
          // Keep scenarios for the other functions
          done();
        });
      });
    });

    it('should return the second challenge if the first answer is correct', function (done) {

      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/first_challenge' };
      server.inject(options, (response) => {
        expect(response.result.data.id).to.equal('second_challenge');
        done();
      });
    });
  });


  describe('(adaptive incorrect answer) GET /api/assessments/:assessment_id/next/:current_challenge_id', function () {

    //assessment
    let insertedAssessmentId = null;

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
            challengeId: 'anyChallengeIdFromAirtable',
            assessmentId: insertedAssessmentId
          };
          knex('answers').delete().then(() => {
            knex('answers').insert([inserted_answer]).then(() => {
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

    it('should return the third challenge if the first answer is incorrect', function (done) {

      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/first_challenge' };
      server.inject(options, (response) => {
        expect(response.result.data.id).to.equal('third_challenge');
        done();
      });
    });
  });


  describe('(adaptive two answers, with any result) GET /api/assessments/:assessment_id/next/:current_challenge_id', function () {

    //assessment
    let insertedAssessmentId = null;

    const insertedAssessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'adaptive_course_id'
    };

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([insertedAssessment]).then((rows) => {
          insertedAssessmentId = rows[0];

          const inserted_answer_1 = {
            value: 'any bad answer',
            result: 'ko',
            challengeId: 'anyChallengeIdFromAirtable',
            assessmentId: insertedAssessmentId
          };
          const inserted_answer_2 = {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'anyChallengeIdFromAirtable',
            assessmentId: insertedAssessmentId
          };
          knex('answers').delete().then(() => {
            knex('answers').insert([inserted_answer_1, inserted_answer_2]).then(() => {
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

    it('should return null if 2 answers are given', function (done) {

      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/first_challenge' };
      server.inject(options, (response) => {
        expect(response.result).to.equal('null');
        done();
      });
    });
  });

});