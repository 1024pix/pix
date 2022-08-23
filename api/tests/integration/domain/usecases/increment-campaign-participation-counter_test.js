const { expect, databaseBuilder, knex } = require('../../../test-helper');
const incrementCampaignParticipationCounter = require('../../../../lib/domain/usecases/increment-campaign-participation-counter');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');

const { STARTED, SHARED } = CampaignParticipationStatuses;

describe('Integration | UseCase | increment-campaign-participation-counter', function () {
  context('on the first participation of the user', function () {
    it('should increment the campaign participationsCount', async function () {
      // given
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        status: STARTED,
      });
      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await incrementCampaignParticipationCounter({
          campaignParticipation,
          campaignRepository,
          campaignParticipationRepository,
          domainTransaction,
        });
      });

      // then
      const campaign = await knex('campaigns').where({ id: campaignParticipation.campaignId }).first();
      expect(campaign.participationsCount).to.equal(1);
      expect(campaign.sharedParticipationsCount).to.equal(0);
    });
  });

  context('when the user improving campaign', function () {
    it('should not increment the campaign participationsCount and decrement the sharedParticipationsCount', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({
        participationsCount: 1,
        sharedParticipationsCount: 1,
      });
      const user = databaseBuilder.factory.buildUser();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: campaign.organizationId,
        userId: user.id,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner.id,
        isImproved: true,
        sharedAt: new Date(),
      });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner.id,
        sharedAt: null,
      });
      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await incrementCampaignParticipationCounter({
          campaignParticipation,
          campaignRepository,
          campaignParticipationRepository,
          domainTransaction,
        });
      });

      // then
      const resultCampaign = await knex('campaigns').where({ id: campaign.id }).first();
      expect(resultCampaign.participationsCount).to.equal(1);
      expect(resultCampaign.sharedParticipationsCount).to.equal(0);
    });

    it('should decrement the sharedParticipationsCount only when the last one is shared', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign({
        participationsCount: 1,
        sharedParticipationsCount: 0,
      });
      const user = databaseBuilder.factory.buildUser();
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: campaign.organizationId,
        userId: user.id,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner.id,
        isImproved: true,
        sharedAt: new Date(),
        status: SHARED,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner.id,
        isImproved: true,
        status: STARTED,
      });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner.id,
        sharedAt: null,
        status: STARTED,
      });
      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await incrementCampaignParticipationCounter({
          campaignParticipation,
          campaignRepository,
          campaignParticipationRepository,
          domainTransaction,
        });
      });

      // then
      const resultCampaign = await knex('campaigns').where({ id: campaign.id }).first();
      expect(resultCampaign.participationsCount).to.equal(1);
      expect(resultCampaign.sharedParticipationsCount).to.equal(0);
    });
  });
});
