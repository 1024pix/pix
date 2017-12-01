const { describe, it, before, after, beforeEach, afterEach, expect, knex, nock } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/cache');
const server = require('../../../server');

describe('Acceptance | API | assessment-controller-get-adaptive', function() {

  before((done) => {

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
          'Competence': ['competence_id'],
          '\u00c9preuves': [
            'z_third_challenge',
            'z_second_challenge',
            'z_first_challenge',
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
      .get('/v0/test-base/Epreuves/z_first_challenge')
      .query(true)
      .reply(200, {
        'id': 'z_first_challenge',
        'fields': {
          'competences': ['competence_id'],
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
          'competences': ['competence_id'],
          'acquis': ['web2']
        },
      });
    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/z_third_challenge')
      .query(true)
      .reply(200, {
        'id': 'z_third_challenge',
        'fields': {
          'competences': ['competence_id'],
          'acquis': ['web3']
        },
      });

    done();
  });

  after((done) => {
    nock.cleanAll();
    cache.flushAll();
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

