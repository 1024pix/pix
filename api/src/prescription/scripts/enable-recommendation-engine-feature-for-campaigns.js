import { commaSeparatedNumberParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { CAMPAIGN_FEATURES } from '../../shared/constants.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';

export class EnableRecommendationEngineFeatureForCampaignsScript extends Script {
  constructor() {
    super({
      description: 'Enables the RECOMMENDATION_ENGINE feature for given campaign IDs',
      permanent: false,
      options: {
        campaignIds: {
          type: 'string',
          describe: 'a list of comma separated campaign ids',
          demandOption: true,
          coerce: commaSeparatedNumberParser(),
        },
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: false,
        },
      },
    });
  }

  async handle({ options, logger }) {
    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();

      const inexistingCampaignIds = [];
      const campaignIdsWithAlreadyEnabledFeature = [];
      const campaignIdsWithEnabledFeature = [];

      const feature = await knexConn('features').where({ key: CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key }).first();
      if (!feature) {
        throw new Error(`Feature ${CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key} not found in features table`);
      }

      for (const campaignId of options.campaignIds) {
        const campaign = await knexConn('campaigns').where({ id: campaignId }).first();

        if (!campaign) {
          inexistingCampaignIds.push(campaignId);
          continue;
        }

        const existingCampaignFeature = await knexConn('campaign-features')
          .where({ campaignId, featureId: feature.id })
          .first();

        if (existingCampaignFeature) {
          campaignIdsWithAlreadyEnabledFeature.push(campaignId);
          continue;
        }

        await knexConn('campaign-features').insert({ featureId: feature.id, campaignId, params: {} });
        campaignIdsWithEnabledFeature.push(campaignId);
      }

      logger.info(
        `${inexistingCampaignIds.length} campaign(s) not found: ${inexistingCampaignIds.length > 0 ? inexistingCampaignIds.join(', ') : ''}`,
      );
      logger.info(
        `${campaignIdsWithAlreadyEnabledFeature.length} campaign(s) already had the feature enabled: ${campaignIdsWithAlreadyEnabledFeature.length > 0 ? campaignIdsWithAlreadyEnabledFeature.join(', ') : 'no campaign impacted'}`,
      );
      logger.info(
        `${campaignIdsWithEnabledFeature.length} campaign(s) newly enabled: ${campaignIdsWithEnabledFeature.length > 0 ? campaignIdsWithEnabledFeature.join(', ') : 'no campaign impacted'}`,
      );

      if (options.dryRun) {
        await knexConn.rollback();
        logger.info('ROLLBACK: no changes were persisted (dry run)');
        logger.info('remove --dryRun to persist changes');
        return;
      }

      logger.info('COMMIT: changes persisted');
    });
  }
}

await ScriptRunner.execute(import.meta.url, EnableRecommendationEngineFeatureForCampaignsScript);
