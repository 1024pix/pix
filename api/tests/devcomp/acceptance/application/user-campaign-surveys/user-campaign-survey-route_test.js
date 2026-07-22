import { createServer } from '../../../../../server.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | API | user-campaign-surveys', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PUT /api/user-campaign-surveys', function () {
    it('should return 200 and store the survey', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;

      await databaseBuilder.factory.buildUserCampaignSurvey({
        userId,
        campaignId,
        satisfactionScore: 3,
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PUT',
        url: '/api/user-campaign-surveys',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        payload: {
          data: {
            type: 'user-campaign-surveys',
            attributes: {
              'campaign-id': campaignId,
              'satisfaction-score': 4,
              'usefulness-score': 2,
              'personalization-score': 3,
              'attractiveness-score': 4,
              comment: 'incroyable',
            },
          },
        },
      });

      // then
      const [userCampaignSurvey] = await knex('user-campaign-surveys').where({ userId, campaignId });
      expect(userCampaignSurvey.survey).to.deep.equal({
        satisfactionScore: 4,
        usefulnessScore: 2,
        personalizationScore: 3,
        attractivenessScore: 4,
        comment: 'incroyable',
      });
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal('user-campaign-surveys');
      expect(response.result.data.id).to.be.a('string');
    });
  });

  describe('GET /api/campaigns/{campaignId}/has-answered-survey', function () {
    it('should return true if user has already answered the survey', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildUserCampaignSurvey({ userId, campaignId, satisfactionScore: 5 });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/campaigns/${campaignId}/has-answered-survey`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.hasAnswered).to.be.true;
    });
  });
});
