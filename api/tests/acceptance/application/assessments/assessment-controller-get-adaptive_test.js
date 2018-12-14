const { databaseBuilder, expect, nock } = require('../../../test-helper');
const areaRawAirTableFixture = require('../../../tooling/fixtures/infrastructure/areaRawAirTableFixture');
const cache = require('../../../../lib/infrastructure/caches/cache');
const createServer = require('../../../../server');

describe('Acceptance | API | assessment-controller-get-adaptive', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  before(() => {
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
          'Épreuves': [
            'z_third_challenge',
            'z_second_challenge',
            'z_first_challenge',
          ],
        },
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Domaines')
      .query(true)
      .reply(200, [
        areaRawAirTableFixture()
      ]);

    nock('https://api.airtable.com')
      .get('/v0/test-base/Competences/competence_id')
      .query(true)
      .reply(200, {
        'id': 'competence_id',
        'fields': {
          'Référence': '1.1 Mener une recherche et une veille d’information',
          'Titre': 'Mener une recherche et une veille d’information',
          'Sous-domaine': '1.1',
          'Domaine': '1. Information et données',
          'Statut': 'validé',
          'Acquis': ['@web1'],
        },
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves')
      .query(true)
      .reply(200, [
        {
          'id': 'z_second_challenge',
          'fields': {
            'competences': ['competence_id'],
            'acquis': ['web2'],
          },
        }, {
          'id': 'z_first_challenge',
          'fields': {
            'competences': ['competence_id'],
            'acquis': ['web1'],
          },
        }, {
          'id': 'z_third_challenge',
          'fields': {
            'competences': ['competence_id'],
            'acquis': ['web3'],
          },
        }, {
          'id': 'other_challenge',
          'fields': {
            'competences': ['other_competence_id'],
            'acquis': ['web4'],
          },
        },
      ]);

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
          'acquis': ['web2'],
        },
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/z_third_challenge')
      .query(true)
      .reply(200, {
        'id': 'z_third_challenge',
        'fields': {
          'competences': ['competence_id'],
          'acquis': ['web3'],
        },
      });

    // Our Epreuves have no Acquix (skillIds) so no need to return anything here
    nock('https://api.airtable.com')
      .get('/v0/test-base/Acquis')
      .query({})
      .reply(200, []);
  });

  after(() => {
    nock.cleanAll();
    cache.flushAll();
  });

  describe('(adaptive) GET /api/assessments/:assessment_id/next', () => {

    const insertedAssessmentId = 123;

    const inserted_assessment = {
      id: insertedAssessmentId,
      courseId: 'the_adaptive_course_id',
      type: 'PLACEMENT',
    };

    beforeEach(() => {
      databaseBuilder.factory.buildAssessment(inserted_assessment);
      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should return HTTP status code 200 with null data when there is not next challenge', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/' + insertedAssessmentId + '/next',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({ data: null });
      });
    });
  });
});
