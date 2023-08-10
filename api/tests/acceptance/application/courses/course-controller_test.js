import {
  expect,
  nock,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
  learningContentBuilder,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';

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
              id: 'rec_active_course_id',
              name: "A la recherche de l'information #01",
              description: "Mener une recherche et une veille d'information",
              isActive: true,
              competenceId: 'competence_id',
              challengeIds: ['k_challenge_id'],
            },
            {
              id: 'rec_inactive_course_id',
              name: 'Mon ami aime les fruits',
              description: 'Une super description',
              isActive: false,
              competenceId: 'competence_id',
              challengeIds: ['k_challenge_id'],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);
    });

    after(function () {
      nock.cleanAll();
    });

    context('when the course exists', function () {
      context('when the course is playable', function () {
        it('should return the course along with a 200 HTTP status code', async function () {
          // when
          const options = {
            method: 'GET',
            url: '/api/courses/rec_active_course_id',
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
          };
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          const course = response.result.data;
          expect(course.id).to.equal('rec_active_course_id');
          expect(course.attributes.name).to.equal("A la recherche de l'information #01");
          expect(course.attributes.description).to.equal("Mener une recherche et une veille d'information");
        });
      });

      context('when the course is not playable', function () {
        it('should return a 404 HTTP status code', async function () {
          // when
          const options = {
            method: 'GET',
            url: '/api/courses/rec_inactive_course_id',
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
          };
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });

    context('when the course does not exist', function () {
      it('should return a 404 HTTP status code', async function () {
        // when
        const options = {
          method: 'GET',
          url: '/api/courses/COUCOUCOUCOCUOC',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
