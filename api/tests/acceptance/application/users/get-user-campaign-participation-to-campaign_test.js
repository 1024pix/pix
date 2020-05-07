const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Route | GET /users/id/campaigns/id/campaign-participations', () => {

  let userId;
  let campaign;
  let campaignParticipation;
  let options;
  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /users/:id/campaigns/:id/campaign-participations', () => {

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      campaign = databaseBuilder.factory.buildCampaign();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign.id });

      options = {
        method: 'GET',
        url: `/api/users/${userId}/campaigns/${campaign.id}/campaign-participations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      return databaseBuilder.commit();
    });

    it('should return campaign participation with 200 HTTP status code', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'campaign-participations',
          id: campaignParticipation.id.toString(),
          attributes: {
            'is-shared': campaignParticipation.isShared,
            'participant-external-id': campaignParticipation.participantExternalId,
            'shared-at': campaignParticipation.sharedAt,
            'created-at': campaignParticipation.createdAt
          },
          relationships: {
            campaign: {
              data: null
            },
            'campaign-participation-result': {
              links: {
                'related': `/api/campaign-participations/${campaignParticipation.id}/campaign-participation-result`
              }
            },
            'campaign-analysis': {
              links: {
                related: `/api/campaign-participations/${campaignParticipation.id}/analyses`
              }
            }
          },
        },
      });
    });
  });
});
