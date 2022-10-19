const { expect, databaseBuilder, LearningContentMock } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | API | assessment-controller-get-next-challenge-for-demo', function () {
  let server;
  const courseId = 'recCourse1';
  const assessmentId = 1;
  let firstChallengeId, secondChallengeId;

  beforeEach(async function () {
    server = await createServer();
    LearningContentMock.mockCommon();
    firstChallengeId = LearningContentMock.getCourseDTO(courseId).challengeIds[0];
    secondChallengeId = LearningContentMock.getCourseDTO(courseId).challengeIds[1];
    databaseBuilder.factory.buildAssessment({
      id: assessmentId,
      type: 'DEMO',
      courseId,
    });
    return databaseBuilder.commit();
  });

  describe('(demo) GET /api/assessments/:assessment_id/next', function () {
    context('when no challenge is answered', function () {
      it('should return 200 HTTP status code', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return application/json', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const response = await server.inject(options);

        // then
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });

      it('should return the first challenge if none already answered', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/assessments/' + assessmentId + '/next',
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data.id).to.equal(firstChallengeId);
      });
    });
  });

  context('when the first challenge is already answered', function () {
    beforeEach(function () {
      databaseBuilder.factory.buildAnswer({ challengeId: firstChallengeId, assessmentId });
      return databaseBuilder.commit();
    });

    it('should return the second challenge', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/assessments/' + assessmentId + '/next',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data.id).to.equal(secondChallengeId);
    });
  });

  context('when all challenges are answered', function () {
    beforeEach(function () {
      databaseBuilder.factory.buildAnswer({ challengeId: firstChallengeId, assessmentId });
      databaseBuilder.factory.buildAnswer({ challengeId: secondChallengeId, assessmentId });
      return databaseBuilder.commit();
    });

    it('should finish the test', async function () {
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
