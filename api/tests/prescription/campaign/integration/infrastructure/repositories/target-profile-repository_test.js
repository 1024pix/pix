import { repositories } from '../../../../../../src/prescription/campaign/infrastructure/repositories/index.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | Target-profile', function () {
  describe('#getByCampaignId', function () {
    let campaignId, targetProfileId;

    beforeEach(async function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildCampaign();
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 40 });
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 20 });

      await databaseBuilder.commit();
    });

    it('should return the target profile matching the campaign id', async function () {
      // when
      const targetProfile = await repositories.targetProfileRepository.getByCampaignId({ campaignId });

      // then
      expect(targetProfile.id).to.equal(targetProfileId);
    });
  });
});
