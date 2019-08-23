const createServer = require('../../../server');
const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const _ = require('lodash');

describe('Acceptance | API | Campaign Report', () => {

  let user;
  let campaign;

  let server;

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser();
    campaign = databaseBuilder.factory.buildCampaign();

    _.times(5, () => {
      return databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        isShared: true,
      });
    });
    _.times(7, () => {
      return databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        isShared: false,
      });
    });

    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  describe('GET /api/campaign/{id}/campaign-report', () => {
    let options;

    beforeEach(async () => {
      options = {
        method: 'GET',
        url: `/api/campaigns/${campaign.id}/campaign-report`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    it('should return the campaignReport of the campaign', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal(campaign.id.toString());
      expect(response.result.data.attributes['participations-count']).to.be.equal(12);
      expect(response.result.data.attributes['shared-participations-count']).to.be.equal(5);
    });
  });
});
