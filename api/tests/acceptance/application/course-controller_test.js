const { expect, nock, generateValidRequestAuthorizationHeader, LearningContentMock } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | Courses', function () {
  let server;
  const userId = 42;
  const courseId = 'recCourse1';

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/courses/:course_id', function () {
    beforeEach(function () {
      LearningContentMock.mockCommon();
    });

    after(function () {
      nock.cleanAll();
    });

    context('when the course exists', function () {
      let options;

      beforeEach(function () {
        options = {
          method: 'GET',
          url: `/api/courses/${courseId}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };
      });

      it('should return 200 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return application/json', async function () {
        // when
        const response = await server.inject(options);

        // then
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });

      it('should return the expected course', async function () {
        // when
        const response = await server.inject(options);

        // then
        const courseData = LearningContentMock.getCourseDTO(courseId);
        const course = response.result.data;
        expect(course.id).to.equal(courseId);
        expect(course.attributes.name).to.equal(courseData.name);
        expect(course.attributes.description).to.equal(courseData.description);
      });
    });

    context('when the course does not exist', function () {
      let options;

      beforeEach(function () {
        options = {
          method: 'GET',
          url: '/api/courses/rec_i_dont_exist',
        };
      });

      it('should return 404 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
