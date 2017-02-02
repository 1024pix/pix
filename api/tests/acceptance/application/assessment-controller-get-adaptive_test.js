/* global describe, before, after, beforeEach, afterEach, knex, nock, it, expect */
const server = require('../../../server');

describe('Acceptance | API | Assessments', function () {


  before(function (done) {

    nock.cleanAll();
    nock('https://api.airtable.com')
      .get('/v0/test-base/Tests/the_adaptive_course_id')
      .query(true)
      .times(4)
      .reply(200, {
        'id': 'the_adaptive_course_id',
        'fields': {
          // a bunch of fields
          'Adaptatif ?': true,
          '\u00c9preuves': [
            'z_second_challenge',
            'z_first_challenge',
          ],
        },
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/z_first_challenge')
      .query(true)
      .times(3)
      .reply(200, {
        'id': 'z_first_challenge',
        'fields': {
          // a bunch of fields
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/z_second_challenge')
      .query(true)
      .reply(200, {
        'id': 'z_second_challenge',
        'fields': {
          // a bunch of fields
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/z_third_challenge')
      .query(true)
      .reply(200, {
        'id': 'z_third_challenge',
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


  describe('(adaptive) GET /api/assessments/:assessment_id/next', function () {

    let inserted_assessment_id = null;

    const inserted_assessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'the_adaptive_course_id'
    };

    beforeEach(function (done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([inserted_assessment]).then((rows) => {
          inserted_assessment_id = rows[0];
          done();
        });
      });
    });

    afterEach(function (done) {
      knex('assessments').delete().then(() => {done();});
    });

    it('should return 200 HTTP status code', function (done) {
      const challengeData = { method: 'GET', url: '/api/assessments/' + inserted_assessment_id + '/next' };
      server.injectThen(challengeData).then((response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function (done) {
      const challengeData = { method: 'GET', url: '/api/assessments/' + inserted_assessment_id + '/next' };
      server.injectThen(challengeData).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should return the first challenge if no challenge specified', function (done) {
      const challengeData = { method: 'GET', url: '/api/assessments/' + inserted_assessment_id + '/next' };
      server.injectThen(challengeData).then((response) => {
        expect(response.result.data.id).to.equal('z_first_challenge');
        done();
      });
    });

  });


});
