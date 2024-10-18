import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper.js';

describe('Quest | Acceptance | Application | Quest Route ', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/campaign-participations/{campaignParticipationId}/quest-results', function () {
    it('should return quest results for given campaignPaticipationId and userId', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
      const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      });
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId,
        userId,
      });
      const rewardId = databaseBuilder.factory.buildAttestation().id;
      databaseBuilder.factory.buildQuest({
        rewardType: 'attestations',
        rewardId,
        eligibilityRequirements: [],
        successRequirements: [],
      }).id;

      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        url: `/api/campaign-participations/${campaignParticipationId}/quest-results`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(1);
    });
  });
});
