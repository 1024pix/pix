const { describe, it, before, after, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | Assessments', function () {

  before(function (done) {
    nock.cleanAll();
    nock('https://api.airtable.com')
      .get('/v0/test-base/Tests/w_adaptive_course_id')
      .query(true)
      .times(4)
      .reply(200, {
        'id': 'w_adaptive_course_id',
        'fields': {
          // a bunch of fields
          'Adaptatif ?': true,
          '\u00c9preuves': [
            'w_second_challenge',
            'w_first_challenge',
          ],
        },
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/w_first_challenge')
      .query(true)
      .times(3)
      .reply(200, {
        'id': 'w_first_challenge',
        'fields': {
          // a bunch of fields
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/w_second_challenge')
      .query(true)
      .reply(200, {
        'id': 'w_second_challenge',
        'fields': {
          // a bunch of fields
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/w_third_challenge')
      .query(true)
      .reply(200, {
        'id': 'w_third_challenge',
        'fields': {
          // a bunch of fields
        },
      });

    done();
  });

  after(function (done) {
    nock.cleanAll();
    server.stop(done);
  });


  describe('(adaptive correct answer) GET /api/assessments/:assessment_id/next/:current_challenge_id', function () {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'w_adaptive_course_id'
    };

    const insertedScenarios = [{
      courseId: 'w_adaptive_course_id',
      path: 'ok',
      nextChallengeId: 'w_second_challenge'
    }, {
      courseId: 'w_adaptive_course_id',
      path: 'ko',
      nextChallengeId: 'w_third_challenge'
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
          done();
        });
      });
    });

    it('should return the second challenge if the first answer is correct', function (done) {

      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/w_first_challenge' };
      server.inject(options, (response) => {
        expect(response.result.data.id).to.equal('w_second_challenge');
        done();
      });
    });
  });

});
