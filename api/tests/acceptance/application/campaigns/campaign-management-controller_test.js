import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | Campaign Management Controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/campaigns/{id}', function () {
    it('should return the campaign details', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const user = databaseBuilder.factory.buildUser.withRole();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/campaigns/${campaign.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal(campaign.id.toString());
    });
  });

  describe('GET /api/admin/campaigns/{id}/participations', function () {
    it('should return participations', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });
      const user = databaseBuilder.factory.buildUser.withRole();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/campaigns/${campaign.id}/participations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].id).to.equal(campaignParticipation.id.toString());
    });
  });
});
