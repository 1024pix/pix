import { expect } from 'chai';
import sinon from 'sinon';

import { EnableRecommendationEngineFeatureForCampaignsScript } from '../../../../src/prescription/scripts/enable-recommendation-engine-feature-for-campaigns.js';
import { CAMPAIGN_FEATURES } from '../../../../src/shared/constants.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('EnableRecommendationEngineFeatureForCampaignsScript', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new EnableRecommendationEngineFeatureForCampaignsScript();
      const { options } = script.metaInfo;

      expect(options.campaignIds).to.deep.include({
        type: 'string',
        describe: 'a list of comma separated campaign ids',
        demandOption: true,
      });

      expect(options.dryRun).to.deep.include({
        type: 'boolean',
        describe: 'Run the script without making any database changes',
        default: false,
      });
    });

    it('parses list of campaignIds', async function () {
      const ids = '1,2,3';
      const script = new EnableRecommendationEngineFeatureForCampaignsScript();
      const { options } = script.metaInfo;
      const parsedData = await options.campaignIds.coerce(ids);

      expect(parsedData).to.deep.equals([1, 2, 3]);
    });
  });

  describe('Handle', function () {
    let script;
    let logger;
    let featureId;

    beforeEach(async function () {
      script = new EnableRecommendationEngineFeatureForCampaignsScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
      featureId = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE).id;
      await databaseBuilder.commit();
    });

    context('when not in dryRun', function () {
      it('adds non-existing campaign id to the inexisting list', async function () {
        // when
        await script.handle({ options: { campaignIds: [999999], dryRun: false }, logger });

        // then
        const campaignFeatures = await knex('campaign-features').where({ featureId });
        expect(campaignFeatures).to.have.lengthOf(0);
        expect(logger.info.calledWithMatch('1 campaign(s) not found')).to.be.true;
      });

      it('adds campaign id with already enabled feature to the already-enabled campaigns list', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignFeature({ campaignId: campaign.id, featureId, params: {} });
        await databaseBuilder.commit();

        // when
        await script.handle({ options: { campaignIds: [campaign.id], dryRun: false }, logger });

        // then
        const campaignFeatures = await knex('campaign-features').where({ campaignId: campaign.id, featureId });
        expect(campaignFeatures).to.have.lengthOf(1);
        expect(logger.info.calledWithMatch('1 campaign(s) already had the feature enabled')).to.be.true;
      });

      it('inserts a campaign-feature record and adds campaign id to the newly-enabled list', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        await databaseBuilder.commit();

        // when
        await script.handle({ options: { campaignIds: [campaign.id], dryRun: false }, logger });

        // then
        const campaignFeatures = await knex('campaign-features').where({ campaignId: campaign.id, featureId });
        expect(campaignFeatures).to.have.lengthOf(1);
        expect(campaignFeatures[0].params).to.deep.equal({});
        expect(logger.info.calledWithMatch('1 campaign(s) newly enabled')).to.be.true;
      });

      it('handles all three cases in a single call', async function () {
        // given
        const existingCampaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignFeature({ campaignId: existingCampaign.id, featureId, params: {} });
        const newCampaign = databaseBuilder.factory.buildCampaign();
        await databaseBuilder.commit();

        const inexistingId = 999999;

        // when
        await script.handle({
          options: { campaignIds: [inexistingId, existingCampaign.id, newCampaign.id], dryRun: false },
          logger,
        });

        // then
        expect(logger.info.calledWithMatch('1 campaign(s) not found')).to.be.true;
        expect(logger.info.calledWithMatch('1 campaign(s) already had the feature enabled')).to.be.true;
        expect(logger.info.calledWithMatch('1 campaign(s) newly enabled')).to.be.true;

        const newCampaignFeatures = await knex('campaign-features').where({ campaignId: newCampaign.id, featureId });
        expect(newCampaignFeatures).to.have.lengthOf(1);
      });
    });

    context('when dryRun is present', function () {
      it('does not persist any database changes', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        await databaseBuilder.commit();

        // when
        await script.handle({ options: { campaignIds: [campaign.id], dryRun: true }, logger });

        // then
        const campaignFeatures = await knex('campaign-features').where({ campaignId: campaign.id, featureId });
        expect(campaignFeatures).to.have.lengthOf(0);
        expect(logger.info.calledWithMatch('1 campaign(s) newly enabled')).to.be.true;
        expect(logger.info.calledWithMatch('ROLLBACK')).to.be.true;
      });

      it('logs that changes were not persisted and how to persist them', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        await databaseBuilder.commit();

        // when
        await script.handle({ options: { campaignIds: [campaign.id], dryRun: true }, logger });

        // then
        expect(logger.info.calledWithMatch('remove --dryRun to persist changes')).to.be.true;
      });
    });
  });
});
