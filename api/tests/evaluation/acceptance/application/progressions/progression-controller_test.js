import {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  mockLearningContent,
  learningContentBuilder,
} from '../../../../test-helper.js';

import { createServer } from '../../../../../server.js';

describe('Acceptance | API | Progressions', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/progressions/:id', function () {
    let assessmentId;
    let userId;

    beforeEach(async function () {
      const learningContent = [
        {
          id: 'recArea1',
          competences: [
            {
              id: 'recCompetence1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [
                    {
                      id: 'recSkill1',
                      challenges: ['recChallenge1'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);

      userId = databaseBuilder.factory.buildUser({}).id;
      const campaignId = databaseBuilder.factory.buildCampaign({ name: 'Campaign' }).id;
      databaseBuilder.factory.buildCampaignSkill({ campaignId });
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      assessmentId = databaseBuilder.factory.buildAssessment({
        userId: userId,
        type: 'CAMPAIGN',
        state: 'completed',
        campaignParticipationId,
      }).id;
      await databaseBuilder.commit();
    });

    context('without authorization token', function () {
      it('should return 401 HTTP status code', function () {
        // given
        const progressionId = assessmentId;
        const options = {
          method: 'GET',
          url: `/api/progressions/${progressionId}`,
          headers: {
            authorization: 'invalid.access.token',
          },
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    context('with authorization token', function () {
      context('when the assessment does not exists', function () {
        it('should respond with a 404', function () {
          // given
          const progressionId = assessmentId + 1;
          const options = {
            method: 'GET',
            url: `/api/progressions/${progressionId}`,
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(404);
          });
        });
      });

      context('allowed to access the progression', function () {
        it('should respond with a 200', function () {
          // given
          const progressionId = assessmentId;
          const options = {
            method: 'GET',
            url: `/api/progressions/${progressionId}`,
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(200);
          });
        });
      });
    });
  });
});
