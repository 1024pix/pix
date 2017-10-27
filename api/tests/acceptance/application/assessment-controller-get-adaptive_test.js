const { describe, it, before, after, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | Assessments', function() {

  before(function(done) {

    nock.cleanAll();
    nock('https://api.airtable.com')
      .get('/v0/test-base/Tests/the_adaptive_course_id')
      .query(true)
      .times(1)
      .reply(200, {
        'id': 'the_adaptive_course_id',
        'fields': {
          // a bunch of fields
          'Adaptatif ?': true,
          'Competence': '1.1',
          '\u00c9preuves': [
            'z_third_challenge',
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
          'acquis': ['web2'],
          'timer': undefined,
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
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves')
      .query(true)
      .reply(200, [{
        'id': 'z_second_challenge',
        'fields': {
          'acquis': ['web2']
        }
      }, {
        'id': 'z_first_challenge',
        'fields': {
          'acquis': ['web1']
        }
      }, {
        'id': 'z_third_challenge',
        'fields': {
          'acquis': ['web3']
        }
      }]);

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

    beforeEach(() => {
      return knex('assessments').insert([inserted_assessment]).then((rows) => {
        insertedAssessmentId = rows[0];
      });
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should return HTTP status code 204 when there is not next challenge', (done) => {
      // given
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };

      // when
      server.inject(options, (response) => {

        // then
        expect(response.statusCode).to.equal(204);
        done();
      });
    });

  });

})
;

