const { expect, databaseBuilder, mockLearningContent, learningContentBuilder } = require('../../../test-helper');
// eslint-disable-next-line no-restricted-modules
const createServer = require('../../../../server');

describe('Acceptance | API | assessment-controller-get-next-challenge-for-demo', function() {

  let server;

  beforeEach(async () => {
    server = await createServer();
    const learningContent = [{
      id: '1. Information et données',
      competences: [{
        id: 'competence_id',
        nameFrFr: 'Mener une recherche et une veille d\'information',
        index: '1.1',
        tubes: [{
          id: 'recTube0_0',
          skills: [{
            id: '@web1',
            nom: '@web1',
            challenges: [
              { id: 'first_challenge' },
              { id: 'second_challenge' },
              { id: 'third_challenge' },
            ],
          }],
        }],
      }],
      courses: [{
        id: 'course_id',
        competenceId: 'competence_id',
        challengeIds: ['first_challenge', 'second_challenge'],
      }],
    }];

    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);
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
