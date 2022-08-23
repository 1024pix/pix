const { expect, databaseBuilder, knex } = require('../../../test-helper');
const updateSharedCampaignParticipationsCount = require('../../../../lib/domain/usecases/update-shared-campaign-participations-count');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');

const { SHARED } = CampaignParticipationStatuses;

describe('Integration | UseCase | update-shared-campaign-participations-count', function () {
  it('should increment sharedParticipationsCount for the campaign associate to campaignParticipationId', async function () {
    // given
    const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
      status: SHARED,
    });
    await databaseBuilder.commit();

    // when
    await DomainTransaction.execute(async (domainTransaction) => {
      await updateSharedCampaignParticipationsCount({
        campaignParticipationId: campaignParticipation.id,
        campaignRepository,
        domainTransaction,
      });
    });

    // then
    const updatedCampaign = await knex('campaigns').where({ id: campaignParticipation.campaignId }).first();
    expect(updatedCampaign.sharedParticipationsCount).to.equal(1);
  });
});
