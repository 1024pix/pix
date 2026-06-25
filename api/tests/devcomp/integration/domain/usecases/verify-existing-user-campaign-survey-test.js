import { usecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Devcomp | Domain | UseCases | verifyExistingUserCampaignSurvey', function () {
  context('when a userCampaignSurvey exists for given campaignId and userId', function () {
    it('returns true', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;

      databaseBuilder.factory.buildUserCampaignSurvey({ userId, campaignId });
      await databaseBuilder.commit();

      // when
      const result = await usecases.verifyExistingUserCampaignSurvey({ userId, campaignId });

      // then
      expect(result).to.be.true;
    });
  });

  context('when a userCampaignSurvey does not exist for given campaignId and userId', function () {
    it('returns false', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;

      databaseBuilder.factory.buildUserCampaignSurvey({ userId: otherUserId, campaignId, satisfactionScore: 3 });

      await databaseBuilder.commit();

      // when
      const result = await usecases.verifyExistingUserCampaignSurvey({ userId, campaignId });

      // then
      expect(result).to.be.false;
    });
  });
});
