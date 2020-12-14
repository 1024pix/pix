const { expect, databaseBuilder } = require('../../../test-helper');
const stageRepository = require('../../../../lib/infrastructure/repositories/stage-repository');

describe('Integration | Repository | StageRepository', () => {

  describe('#findByCampaignId', () => {
    it('should retrieve stage given campaignId', async () => {
      // given
      const tagetProfile = databaseBuilder.factory.buildTargetProfile();
      const campaign = databaseBuilder.factory.buildCampaign();

      databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 24 });
      databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 55 });

      databaseBuilder.factory.buildStage({ targetProfileId: tagetProfile.id });

      await databaseBuilder.commit();

      // when
      const stages = await stageRepository.findByCampaignId(campaign.id);

      // then
      expect(stages.length).to.equal(2);

      expect(stages[0].threshold).to.equal(24);
      expect(stages[1].threshold).to.equal(55);
    });
  });
});
