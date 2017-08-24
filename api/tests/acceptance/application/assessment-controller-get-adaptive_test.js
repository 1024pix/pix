const { describe, it, before, after, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | Assessments', function() {

  before(function(done) {

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
      .reply(200, {
        'id': 'z_first_challenge',
        'fields': {
          'acquis': ['web1']
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/z_second_challenge')
      .query(true)
      .reply(200, {
        'id': 'z_second_challenge',
        'fields': {
          'acquis': ['web2']
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/z_third_challenge')
      .query(true)
      .reply(200, {
        'id': 'z_third_challenge',
        'fields': {
          'acquis': ['web3']
        },
      });

    done();
  });

  after(function(done) {
    nock.cleanAll();
    server.stop(done);
  });

  describe('(adaptive) GET /api/assessments/:assessment_id/next', function() {

    let insertedAssessmentId = null;

    const inserted_assessment = {
      courseId: 'the_adaptive_course_id'
    };

    beforeEach(function(done) {
      knex('assessments').delete().then(() => {
        knex('assessments').insert([inserted_assessment]).then((rows) => {
          insertedAssessmentId = rows[0];
          done();
        });
      });
    });

    afterEach(function(done) {
      knex('assessments').delete().then(() => {done();});
    });

    it('should return 200 HTTP status code', function(done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };
      server.inject(options, (response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function(done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };
      server.inject(options, (response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should return the first challenge if no challenge specified', function(done) {
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };
      server.inject(options, (response) => {
        expect(response.result.data.id).to.equal('z_first_challenge');
        done();
      });
    });

  });

});
