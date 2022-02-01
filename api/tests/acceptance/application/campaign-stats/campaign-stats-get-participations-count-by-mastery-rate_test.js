const createServer = require('../../../../server');
const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');

describe('Acceptance | API | Campaign Stats | GetParticipationCountByMasteryRate', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/campaigns/{id}/stats/participations-by-mastery-rate', function () {
    it('should return the mastery rate distribution', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.5, sharedAt: '2020-01-01' });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/campaigns/${campaignId}/stats/participations-by-mastery-rate`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const { statusCode, result } = await server.inject(options);

      expect(statusCode).to.equal(200);
      expect(result.data.attributes['result-distribution']).to.deep.equal([{ count: 1, masteryRate: '0.50' }]);
    });
  });
});
