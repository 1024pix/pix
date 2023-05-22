import { expect, databaseBuilder, knex } from '../../../test-helper.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import * as campaignParticipationRepository from '../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';

import { deleteCampaignParticipationForAdmin } from '../../../../lib/domain/usecases/delete-campaign-participation-for-admin.js';

describe('Integration | UseCases | delete-campaign-participation-for-admin', function () {
  it('should delete all campaignParticipations', async function () {
    // given
    const adminUserId = databaseBuilder.factory.buildUser().id;
    const campaignId = databaseBuilder.factory.buildCampaign().id;
    const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
    databaseBuilder.factory.buildCampaignParticipation({
      isImproved: true,
      organizationLearnerId,
      campaignId,
    });
    const campaignParticipationToDelete = databaseBuilder.factory.buildCampaignParticipation({
      isImproved: false,
      organizationLearnerId,
      campaignId,
    });

    await databaseBuilder.commit();

    // when
    await DomainTransaction.execute((domainTransaction) => {
      return deleteCampaignParticipationForAdmin({
        userId: adminUserId,
        campaignParticipationId: campaignParticipationToDelete.id,
        domainTransaction,
        campaignRepository,
        campaignParticipationRepository,
      });
    });

    // then
    const results = await knex('campaign-participations').where({ organizationLearnerId });

    expect(results.length).to.equal(2);
    results.forEach((campaignParticipaton) => {
      expect(campaignParticipaton.deletedAt).not.to.equal(null);
      expect(campaignParticipaton.deletedBy).to.equal(adminUserId);
    });
  });
});
