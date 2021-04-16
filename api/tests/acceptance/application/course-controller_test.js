const { expect, nock, generateValidRequestAuthorizationHeader, mockLearningContent, learningContentBuilder, HttpTestServer } = require('../../test-helper');
const moduleUnderTest = require('../../../lib/application/courses');

describe('Acceptance | API | Courses', () => {

  let server;
  const userId = 42;

  before(async () => {
    const authenticationEnabled = false;
    server = new HttpTestServer(moduleUnderTest, authenticationEnabled);
  });

  describe('GET /api/courses/:course_id', () => {

    beforeEach(() => {

      const learningContent = [{
        id: '1. Information et données',
        competences: [{
          id: 'competence_id',
          tubes: [{
            id: 'recTube1',
            skills: [{
              challenges: [
                { id: 'k_challenge_id' },
              ],
            }],
          }],
        }],
        courses: [{
          id: 'rec_course_id',
          name: 'A la recherche de l\'information #01',
          description: 'Mener une recherche et une veille d\'information',
          competenceId: 'competence_id',
          challengeIds: ['k_challenge_id'],
        }],
      }];

      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningContentObjects);
    });

    after(() => {
      nock.cleanAll();
    });

    context('when the course exists', () => {
      let request;

      beforeEach(() => {
        request = {
          method: 'GET',
          url: '/api/courses/rec_course_id',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(200);

      });

      it('should return application/json', async() => {
        // when
        const response = await server.requestObject(request);

        // then
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');

      });

      it('should return the expected course', async() => {
        // when
        const response = await server.requestObject(request);

        // then
        const course = response.result.data;
        expect(course.id).to.equal('rec_course_id');
        expect(course.attributes.name).to.equal('A la recherche de l\'information #01');
        expect(course.attributes.description).to.equal('Mener une recherche et une veille d\'information');

      });

    });

    context('when the course does not exist', async() => {
      let request;

      beforeEach(() => {
        request = {
          method: 'GET',
          url: '/api/courses/rec_i_dont_exist',
        };
      });

      it('should return 404 HTTP status code', async() => {
        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(404);

      });
    });
  });
});
