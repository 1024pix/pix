const { expect, databaseBuilder, knex } = require('../../../test-helper');
const updateCampaignCountsAfterDeleteParticipation = require('../../../../lib/domain/usecases/update-campaign-counts-after-delete-participation');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');

const { STARTED, SHARED, TO_SHARE } = CampaignParticipationStatuses;

describe('Integration | UseCase | update-campaign-counts-after-delete-participation', function () {
  context('when the deleted campaign participation was not shared', function () {
    it('should only decrement the campaign participationsCount', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ participationsCount: 1 });
      const campaignParticipation = new CampaignParticipation(
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          deletedAt: new Date(),
          status: STARTED,
        })
      );
      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await updateCampaignCountsAfterDeleteParticipation({
          campaignId: campaign.id,
          deletedCampaignParticipations: [campaignParticipation],
          campaignRepository,
          domainTransaction,
        });
      });

      // then
      const updatedCampaign = await knex('campaigns').where({ id: campaign.id }).first();
      expect(updatedCampaign.participationsCount).to.equal(0);
      expect(updatedCampaign.sharedParticipationsCount).to.equal(0);
    });
  });

  context('when the deleted campaign participation was shared', function () {
    it('should decrement the campaign sharedParticipationsCount', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ participationsCount: 1, sharedParticipationsCount: 1 });
      const campaignParticipation = new CampaignParticipation(
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          deletedAt: new Date(),
          status: SHARED,
          isImproved: false,
        })
      );
      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await updateCampaignCountsAfterDeleteParticipation({
          campaignId: campaign.id,
          deletedCampaignParticipations: [campaignParticipation],
          campaignRepository,
          domainTransaction,
        });
      });

      // then
      const updatedCampaign = await knex('campaigns').where({ id: campaign.id }).first();
      expect(updatedCampaign.participationsCount).to.equal(0);
      expect(updatedCampaign.sharedParticipationsCount).to.equal(0);
    });
  });

  context('when the deleted campaign participation was shared then improved', function () {
    it('should decrement the campaign sharedParticipationsCount', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({ participationsCount: 1, sharedParticipationsCount: 0 });
      const sharedImprovedCampaignParticipation = new CampaignParticipation(
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          deletedAt: new Date(),
          status: SHARED,
          isImproved: true,
        })
      );
      const improvingCampaignParticipation = new CampaignParticipation(
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          deletedAt: new Date(),
          status: TO_SHARE,
          isImproved: false,
        })
      );
      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await updateCampaignCountsAfterDeleteParticipation({
          campaignId: campaign.id,
          deletedCampaignParticipations: [sharedImprovedCampaignParticipation, improvingCampaignParticipation],
          campaignRepository,
          domainTransaction,
        });
      });

      // then
      const updatedCampaign = await knex('campaigns').where({ id: campaign.id }).first();
      expect(updatedCampaign.participationsCount).to.equal(0);
      expect(updatedCampaign.sharedParticipationsCount).to.equal(0);
    });
  });
});
