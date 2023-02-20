import {
  expect,
  nock,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
  learningContentBuilder,
} from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | API | Courses', function () {
  let server;
  const userId = 42;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/courses/:course_id', function () {
    beforeEach(function () {
      const learningContent = [
        {
          id: '1. Information et données',
          competences: [
            {
              id: 'competence_id',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      challenges: [{ id: 'k_challenge_id' }],
                    },
                  ],
                },
              ],
            },
          ],
          courses: [
            {
              id: 'rec_course_id',
              name: "A la recherche de l'information #01",
              description: "Mener une recherche et une veille d'information",
              competenceId: 'competence_id',
              challengeIds: ['k_challenge_id'],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);
    });

    after(function () {
      nock.cleanAll();
    });

    context('when the course exists', function () {
      let options;

      beforeEach(function () {
        options = {
          method: 'GET',
          url: '/api/courses/rec_course_id',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };
      });

      it('should return 200 HTTP status code', function () {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should return application/json', function () {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const contentType = response.headers['content-type'];
          expect(contentType).to.contain('application/json');
        });
      });

      it('should return the expected course', function () {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const course = response.result.data;
          expect(course.id).to.equal('rec_course_id');
          expect(course.attributes.name).to.equal("A la recherche de l'information #01");
          expect(course.attributes.description).to.equal("Mener une recherche et une veille d'information");
        });
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

      it('should return 404 HTTP status code', function () {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(404);
        });
      });
    });
  });
});
