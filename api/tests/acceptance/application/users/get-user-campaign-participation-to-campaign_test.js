import { expect, generateValidRequestAuthorizationHeader, databaseBuilder } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Route | GET /users/id/campaigns/id/campaign-participations', function () {
  let userId;
  let campaign;
  let campaignParticipation;
  let options;
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /users/:id/campaigns/:id/campaign-participations', function () {
    beforeEach(function () {
      userId = databaseBuilder.factory.buildUser().id;
      campaign = databaseBuilder.factory.buildCampaign();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId: campaign.id,
        status: 'SHARED',
      });

      options = {
        method: 'GET',
        url: `/api/users/${userId}/campaigns/${campaign.id}/campaign-participations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      return databaseBuilder.commit();
    });

    it('should return campaign participation with 200 HTTP status code', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'campaign-participations',
          id: campaignParticipation.id.toString(),
          attributes: {
            'is-shared': true,
            'participant-external-id': campaignParticipation.participantExternalId,
            'shared-at': campaignParticipation.sharedAt,
            'deleted-at': campaignParticipation.deletedAt,
            'created-at': campaignParticipation.createdAt,
          },
          relationships: {
            campaign: {
              data: null,
            },
            trainings: {
              links: {
                related: `/api/campaign-participations/${campaignParticipation.id}/trainings`,
              },
            },
          },
        },
      });
    });
  });
});
