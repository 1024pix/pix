const { expect, nock, databaseBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/cache');
const createServer = require('../../../../server');

describe('Acceptance | API | assessment-controller-get-nonadaptive', function() {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  before(() => {
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
          'Titre': 'Mener une recherche et une veille d\'information',
          'Sous-domaine': '1.1',
          'Référence': '1.1 Mener une recherche et une veille d\'information',
          'Domaine': '1. Information et données',
          'Statut': 'validé',
          'Acquis': ['@web1']
        }
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/first_challenge')
      .query(true)
      .reply(200, {
        'id': 'first_challenge',
        'fields': {
          'competences': ['competence_id'],
          // a bunch of fields
        },
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Epreuves/second_challenge')
      .query(true)
      .reply(200, {
        'id': 'second_challenge',
        'fields': {
          'competences': ['competence_id'],
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
  });

  after(() => {
    nock.cleanAll();
    cache.flushAll();
  });

  describe('(non-adaptive) GET /api/assessments/:assessment_id/next', () => {

    const assessmentId = 1;

    context('when no challenge is answered', function() {

      beforeEach(() => {
        databaseBuilder.factory.buildAssessment({ id: assessmentId, type: 'DEMO', courseId: 'a_non_adaptive_course_id' });
        return databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', () => {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        return server.inject(options).then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should return application/json', () => {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const contentType = response.headers['content-type'];
          expect(contentType).to.contain('application/json');
        });
      });

      it('should return the first challenge if none already answered', () => {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result.data.id).to.equal('first_challenge');
        });
      });
    });

    context('when the first challenge is already answered', function() {
      beforeEach(() => {
        databaseBuilder.factory.buildAssessment({ id: assessmentId, type: 'DEMO', courseId: 'a_non_adaptive_course_id' });
        databaseBuilder.factory.buildAnswer({ challengeId: 'first_challenge', assessmentId });
        return databaseBuilder.commit();
      });

      it('should return the second challenge', async () => {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result.data.id).to.equal('second_challenge');
        });
      });
    });

    context('when all challenges are answered', function() {
      beforeEach(() => {
        databaseBuilder.factory.buildAssessment({ id: assessmentId, type: 'DEMO', courseId: 'a_non_adaptive_course_id' });
        databaseBuilder.factory.buildAnswer({ challengeId: 'first_challenge', assessmentId });
        databaseBuilder.factory.buildAnswer({ challengeId: 'second_challenge', assessmentId });
        return databaseBuilder.commit();
      });

      it('should finish the test', async () => {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: null
        });
      });
    });
  });
});
