import { databaseBuilder, expect, generateValidRequestAuthorizationHeader, knex } from '../../../test-helper';
import createServer from '../../../../server';

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

  describe('PATCH /api/admin/campaigns/{id}', function () {
    it('should return the updated campaign', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ name: 'odlName', multipleSendings: false });
      const user = databaseBuilder.factory.buildUser.withRole();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/admin/campaigns/${campaign.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            attributes: {
              name: 'newName',
              title: campaign.title,
              'custom-landing-page-text': campaign.customLandingPageText,
              'custom-result-page-button-text': null,
              'custom-result-page-button-url': null,
              'custom-result-page-text': null,
              'multiple-sendings': true,
            },
          },
        },
      });
      const updatedCampaign = await knex('campaigns').first();
      // then
      expect(response.statusCode).to.equal(204);
      expect(updatedCampaign.name).to.equal('newName');
      expect(updatedCampaign.multipleSendings).to.be.true;
    });
  });
});
