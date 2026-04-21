import { hasCampaignParticipations } from '../../../../../src/privacy/infrastructure/repositories/campaign-participations-api.repository.js';

describe('Unit | Privacy | Infrastructure | Repositories | campaign-participations-api', function () {
  describe('#hasCampaignParticipations', function () {
    it('indicates if user has campaign participations', async function () {
      // given
      const dependencies = {
        campaignParticipationsApi: {
          hasCampaignParticipations: async () => true,
        },
      };

      // when
      const result = await hasCampaignParticipations({ userId: '123', dependencies });

      // then
      expect(result).to.be.true;
    });
  });
});
