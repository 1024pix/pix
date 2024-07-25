import { constants } from '../../../../src/shared/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
  sinon,
} from '../../../test-helper.js';

describe('Acceptance | Controller | users-controller-get-campaign-participation-overviews', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /users/1/campaign-participation-overviews', function () {
    let userId;
    let options;

    beforeEach(function () {
      const user = databaseBuilder.factory.buildUser();
      userId = user.id;

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
                      id: 'recSkillId1',
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

      return databaseBuilder.commit();
    });

    it('should return participation which match with filters', async function () {
      // given
      sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

      const startedCampaignParticipation = databaseBuilder.factory.campaignParticipationOverviewFactory.buildOnGoing({
        userId,
        campaignSkills: ['recSkillId1'],
      });
      const sharableCampaignParticipation = databaseBuilder.factory.campaignParticipationOverviewFactory.buildToShare({
        userId,
        campaignSkills: ['recSkillId1'],
      });
      databaseBuilder.factory.campaignParticipationOverviewFactory.buildEnded({
        userId,
        campaignSkills: ['recSkillId1'],
      });

      await databaseBuilder.commit();
      options = {
        method: 'GET',
        url: `/api/users/${userId}/campaign-participation-overviews?filter[states][]=ONGOING&filter[states][]=TO_SHARE`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const participationIds = response.result.data.map(({ id }) => Number(id));
      expect(participationIds).to.deep.equals([sharableCampaignParticipation.id, startedCampaignParticipation.id]);
    });
  });
});
