const { describe, it, before, after, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | Assessments GET (non adaptive)', function () {

  before(function (done) {
    
    nock.cleanAll();
    nock('https://api.airtable.com')
      .get('/v0/test-base/Tests/a_non_adaptive_course_id')
      .query(true)
      .times(4)
      .reply(200, {
        'id': 'a_non_adaptive_course_id',
        'fields': {
          // a bunch of fields
          'Adaptatif ?': false,
          '\u00c9preuves': [
            'second_challenge',
            'first_challenge',
          ],
        },
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/first_challenge')
      .query(true)
      .reply(200, {
        'id': 'first_challenge',
        'fields': {
          // a bunch of fields
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/second_challenge')
      .query(true)
      .reply(200, {
        'id': 'second_challenge',
        'fields': {
          // a bunch of fields
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/third_challenge')
      .query(true)
      .reply(200, {
        'id': 'third_challenge',
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

  describe('(non-adaptive) GET /api/assessments/:assessment_id/next', function () {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      userName: 'John Doe',
      userEmail: 'john.doe@mailmail.com',
      courseId: 'a_non_adaptive_course_id'
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

});
