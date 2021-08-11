const { databaseBuilder, expect, generateValidRequestAuthorizationHeader, knex } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | Campaign Management Controller', () => {
  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/admin/campaigns/{id}', () => {
    it('should return the campaign details', async () => {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const user = databaseBuilder.factory.buildUser.withPixRolePixMaster();
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

  describe('PATCH /api/admin/campaigns/{id}', () => {
    it('should return the updated campaign', async () => {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ name: 'odlName' });
      const user = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/admin/campaigns/${campaign.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: { data: { attributes: {
          name: 'newName',
          title: campaign.title,
          'custom-landing-page-text': campaign.customLandingPageText,
          'custom-result-page-button-text': null,
          'custom-result-page-button-url': null,
          'custom-result-page-text': null } } },
      });
      const updatedCampaign = await knex('campaigns').first();
      // then
      expect(response.statusCode).to.equal(204);
      expect(updatedCampaign.name).to.equal('newName');
    });
  });
});
