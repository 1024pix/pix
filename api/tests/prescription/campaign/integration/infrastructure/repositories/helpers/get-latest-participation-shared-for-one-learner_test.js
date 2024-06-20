import { getLatestParticipationSharedForOneLearner } from '../../../../../../../src/prescription/campaign/infrastructure/repositories/helpers/get-latest-participation-shared-for-one-learner.js';
import { CampaignParticipationStatuses } from '../../../../../../../src/prescription/shared/domain/constants.js';
import { databaseBuilder, expect, knex } from '../../../../../../test-helper.js';

describe('Integration | Infrastructure | Repository | Helpers | get-latest-participation-shared-for-one-learner', function () {
  describe('#getLatestParticipationSharedForOneLearner', function () {
    it('should retrieve the last participation shared by learner', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ multipleSendings: true, type: 'ASSESSMENT' }).id;
      const firstLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId }).id;
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: firstLearnerId,
        campaignId,
        userId,
        status: CampaignParticipationStatuses.SHARED,
        sharedAt: new Date('2023-01-01'),
        masteryRate: 0.7,
        isImproved: true,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        organizationLearnerId: firstLearnerId,
        campaignId,
        userId,
        status: CampaignParticipationStatuses.STARTED,
        sharedAt: new Date('2024-01-01'),
        masteryRate: 0.1,
      });

      await databaseBuilder.commit();

      const result = await knex
        .select(['organizationLearnerId', getLatestParticipationSharedForOneLearner(knex, 'masteryRate', campaignId)])
        .from('campaign-participations as cp')
        .where({ campaignId })
        .groupBy('organizationLearnerId');

      expect(result.length).to.equal(1);
      expect(result[0].organizationLearnerId).to.equal(firstLearnerId);
      expect(result[0].masteryRate).to.equal('0.70');
    });
  });
});
