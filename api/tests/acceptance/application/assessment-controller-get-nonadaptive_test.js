const { describe, it, before, after, expect, knex, nock } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/cache');
const server = require('../../../server');

describe('Acceptance | API | assessment-controller-get-nonadaptive', function() {

  before((done) => {

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
          'Competence': ['competence_id'],
          '\u00c9preuves': [
            'second_challenge',
            'first_challenge',
          ],
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Competences/competence_id')
      .query(true)
      .reply(200, {
        'id': 'competence_id',
        'fields': {
          'Référence': 'challenge-view',
          'Titre': 'Mener une recherche et une veille d\'information',
          'Sous-domaine': '1.1',
          'Domaine': '1. Information et données',
          'Statut': 'validé',
          'Acquis': ['@web1']
        }
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves')
      .query({ view: 'challenge-view' })
      .reply(200, [{
        'id': 'z_second_challenge',
        'fields': {
          'competences': ['competence_id'],
          'acquis': ['web2']
        }
      }, {
        'id': 'z_first_challenge',
        'fields': {
          'competences': ['competence_id'],
          'acquis': ['web1']
        }
      }, {
        'id': 'z_third_challenge',
        'fields': {
          'competences': ['competence_id'],
          'acquis': ['web3']
        }
      }]);
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
          'competences': ['competence_id'],
          // a bunch of fields
        },
      });

    done();
  });

  after((done) => {
    nock.cleanAll();
    cache.flushAll();
    server.stop(done);
  });

  describe('(non-adaptive) GET /api/assessments/:assessment_id/next', function() {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      courseId: 'a_non_adaptive_course_id'
    };

    before(function() {
      return knex('assessments')
        .delete()
        .then(() => {
          return knex('assessments').insert([insertedAssessment]);
        })
        .then((rows) => {
          insertedAssessmentId = rows[0];
        });
    });

    after(function() {
      return knex('assessments').delete();
    });

    it('should return 200 HTTP status code', function() {
      // Given
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };

      // When
      return server.injectThen(options).then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return application/json', function() {
      // Given
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };

      // When
      return server.injectThen(options).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should return the first challenge if no challenge specified', function() {
      // Given
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next' };

      // When
      return server.injectThen(options).then((response) => {
        expect(response.result.data.id).to.equal('first_challenge');
      });
    });

    it('should return the next challenge otherwise', function() {
      // Given
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/first_challenge' };

      // When
      return server.injectThen(options).then((response) => {
        expect(response.result.data.id).to.equal('second_challenge');
      });
    });

    it('should return null if reached the last challenge of the course', function() {
      // Given
      const options = { method: 'GET', url: '/api/assessments/' + insertedAssessmentId + '/next/second_challenge' };

      // When
      return server.injectThen(options).then((response) => {
        expect(response.result).to.be.null;
        expect(response.statusCode).to.equal(204);
      });
    });

  });

});
