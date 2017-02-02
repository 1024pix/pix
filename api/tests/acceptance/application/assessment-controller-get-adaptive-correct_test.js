/* global describe, before, after, beforeEach, afterEach, knex, nock, it, expect */
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

    //assessment
    let inserted_assessment_id = null;

    const inserted_assessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'w_adaptive_course_id'
    };

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([inserted_assessment]).then((rows) => {
          inserted_assessment_id = rows[0];

          const inserted_answer = {
            value: 'any good answer',
            result: 'ok',
            challengeId: 'anyChallengeIdFromAirtable',
            assessmentId: inserted_assessment_id
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

    it('should return the second challenge if the first answer is correct', function (done) {

      const challengeData = { method: 'GET', url: '/api/assessments/' + inserted_assessment_id + '/next/w_first_challenge' };
      server.injectThen(challengeData).then((response) => {
        expect(response.result.data.id).to.equal('w_second_challenge');
        done();
      });
    });
  });



});
