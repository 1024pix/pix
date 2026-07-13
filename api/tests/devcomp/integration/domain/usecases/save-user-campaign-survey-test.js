import { usecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Devcomp | Domain | UseCases | save-user-campaign-survey', function () {
  it('should save a UserCampaignSurvey and return its id', async function () {
    // given
    const userId = databaseBuilder.factory.buildUser().id;
    const campaignId = databaseBuilder.factory.buildCampaign().id;

    const satisfactionScore = 4;

    await databaseBuilder.commit();

    // when
    const result = await usecases.saveUserCampaignSurvey({
      userId,
      campaignId,
      satisfactionScore,
    });

    // then
    expect(result).to.be.greaterThan(0);
  });
});
