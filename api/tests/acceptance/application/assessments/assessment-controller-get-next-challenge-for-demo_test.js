const { expect, nock, databaseBuilder, airtableBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const createServer = require('../../../../server');

describe('Acceptance | API | assessment-controller-get-next-challenge-for-demo', function() {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  before(() => {
    const course = airtableBuilder.factory.buildCourse({
      'id':'course_id',
      'competence': ['competence_id'],
      'epreuves': [
        'second_challenge',
        'first_challenge',
      ],
    });
    airtableBuilder
      .mockList({ tableName: 'Tests' })
      .returns([course])
      .activate();

    const competence = airtableBuilder.factory.buildCompetence({
      'id': 'competence_id',
      'titre': 'Mener une recherche et une veille d\'information',
      'sousDomaine': '1.1',
      'reference': '1.1 Mener une recherche et une veille d\'information',
      'domaineIds': ['1. Information et données'],
      'acquisViaTubes': ['@web1'],
    });

    airtableBuilder
      .mockList({ tableName: 'Compétences' })
      .returns([competence])
      .activate();

    const firstChallenge = airtableBuilder.factory.buildChallenge({
      'id': 'first_challenge',
      'competences': ['competence_id'],
      'acquix':['@web1'],
    });
    const secondChallenge = airtableBuilder.factory.buildChallenge({
      'id': 'second_challenge',
      'competences': ['competence_id'],
      'acquix':['@web1'],
    });
    const thirdChallenge = airtableBuilder.factory.buildChallenge({
      'id': 'third_challenge',
      'competences': ['competence_id'],
      'acquix':['@web1'],
    });
    
    airtableBuilder
      .mockList({ tableName: 'Epreuves' })
      .returns([firstChallenge, secondChallenge, thirdChallenge])
      .activate();

    const skill = airtableBuilder.factory.buildSkill({
      'id': '@web1',
      'epreuves': ['first_challenge', 'second_challenge', 'third_challenge'],
      'compétenceViaTube': ['competence_id'],
    });

    airtableBuilder
      .mockList({ tableName: 'Acquis' })
      .returns([skill])
      .activate();
  });

  after(() => {
    nock.cleanAll();
    return cache.flushAll();
  });

  describe('(demo) GET /api/assessments/:assessment_id/next', () => {

    const assessmentId = 1;

    context('when no challenge is answered', function() {

      beforeEach(() => {
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: 'DEMO',
          courseId: 'course_id',
        });
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
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: 'DEMO',
          courseId: 'course_id',
        });
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
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: 'DEMO',
          courseId: 'course_id',
        });
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
          data: null,
        });
      });
    });
  });
});
