import { expect } from 'chai';
import sinon from 'sinon';

import { SetHighlightedTrainingsForCampaignScript } from '../../../../src/prescription/scripts/set-highlighted-trainings-for-campaign.js';
import { CAMPAIGN_FEATURES } from '../../../../src/shared/constants.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('SetHighlightedTrainingsForCampaignScript', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      // given & when
      const script = new SetHighlightedTrainingsForCampaignScript();
      const { options } = script.metaInfo;

      // then
      expect(options.campaignId).to.deep.include({
        type: 'number',
        describe: 'the campaign id',
        demandOption: true,
      });

      expect(options.highlightedTrainingIds).to.deep.include({
        type: 'string',
        describe: 'a list of comma separated training ids to highlight',
        demandOption: true,
      });

      expect(options.dryRun).to.deep.include({
        type: 'boolean',
        describe: 'Run the script without making any database changes',
        default: true,
      });
    });

    it('parses list of highlightedTrainingIds', async function () {
      // given & when
      const ids = '1,2,3';
      const script = new SetHighlightedTrainingsForCampaignScript();
      const { options } = script.metaInfo;
      const parsedData = await options.highlightedTrainingIds.coerce(ids);

      // then
      expect(parsedData).to.deep.equals([1, 2, 3]);
    });
  });

  describe('Handle', function () {
    let script;
    let logger;
    let featureId;

    beforeEach(async function () {
      script = new SetHighlightedTrainingsForCampaignScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
      featureId = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE).id;
      await databaseBuilder.commit();
    });

    context('when the campaign does not have the RECOMMENDATION_ENGINE feature enabled', function () {
      it('throws an error and does not update anything', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        await databaseBuilder.commit();

        // when
        const error = await catchErr(script.handle)({
          options: { campaignId: campaign.id, highlightedTrainingIds: [1], dryRun: false },
          logger,
        });

        // then
        expect(error.message).to.equal(
          `Campaign ${campaign.id} does not have the ${CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key} feature enabled`,
        );
      });
    });

    context('when a highlighted training id does not exist', function () {
      it('throws an error and does not update the campaign feature', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignFeature({ campaignId: campaign.id, featureId, params: {} });
        const training = databaseBuilder.factory.buildTraining();
        await databaseBuilder.commit();

        const missingTrainingId = training.id + 1000;

        // when
        const error = await catchErr(script.handle)({
          options: {
            campaignId: campaign.id,
            highlightedTrainingIds: [training.id, missingTrainingId],
            dryRun: false,
          },
          logger,
        });

        // then
        expect(error.message).to.equal(`Training(s) not found in "trainings" table: ${missingTrainingId}`);

        const campaignFeature = await knex('campaign-features').where({ campaignId: campaign.id, featureId }).first();
        expect(campaignFeature.params).to.deep.equal({});
      });
    });

    context(
      'when the campaign has the recommendation engine feature enabled, and all provided training ids exist',
      function () {
        it('overwrites params with the highlighted training ids', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign();
          databaseBuilder.factory.buildCampaignFeature({
            campaignId: campaign.id,
            featureId,
            params: { someOtherKey: 'shouldBeOverwritten' },
          });
          const training1 = databaseBuilder.factory.buildTraining();
          const training2 = databaseBuilder.factory.buildTraining();
          await databaseBuilder.commit();

          // when
          await script.handle({
            options: { campaignId: campaign.id, highlightedTrainingIds: [training1.id, training2.id], dryRun: false },
            logger,
          });

          // then
          const campaignFeature = await knex('campaign-features').where({ campaignId: campaign.id, featureId }).first();
          expect(campaignFeature.params).to.deep.equal({ highlightedTrainingIds: [training1.id, training2.id] });
          expect(logger.info.calledWithMatch('COMMIT: changes persisted')).to.be.true;
        });
      },
    );

    context('when dryRun is present', function () {
      it('does not persist any database changes', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignFeature({ campaignId: campaign.id, featureId, params: {} });
        const training = databaseBuilder.factory.buildTraining();
        await databaseBuilder.commit();

        // when
        await script.handle({
          options: { campaignId: campaign.id, highlightedTrainingIds: [training.id], dryRun: true },
          logger,
        });

        // then
        const campaignFeature = await knex('campaign-features').where({ campaignId: campaign.id, featureId }).first();
        expect(campaignFeature.params).to.deep.equal({});
        expect(logger.info.calledWithMatch('ROLLBACK')).to.be.true;
      });
    });
  });
});
