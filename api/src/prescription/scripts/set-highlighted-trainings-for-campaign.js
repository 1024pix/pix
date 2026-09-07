import { commaSeparatedNumberParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { CAMPAIGN_FEATURES } from '../../shared/constants.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';

export class SetHighlightedTrainingsForCampaignScript extends Script {
  constructor() {
    super({
      description:
        'Sets the highlighted training ids (params.highlightedTrainingIds) for a campaign already having the RECOMMENDATION_ENGINE feature enabled',
      permanent: false,
      options: {
        campaignId: {
          type: 'number',
          describe: 'the campaign id',
          demandOption: true,
        },
        highlightedTrainingIds: {
          type: 'string',
          describe: 'a list of comma separated training ids to highlight',
          demandOption: true,
          coerce: commaSeparatedNumberParser(),
        },
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();
      const { campaignId, highlightedTrainingIds } = options;

      const feature = await knexConn('features').where({ key: CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key }).first();
      if (!feature) {
        throw new Error(`Feature ${CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key} not found in "features" table`);
      }

      const campaignFeature = await knexConn('campaign-features').where({ campaignId, featureId: feature.id }).first();
      if (!campaignFeature) {
        throw new Error(
          `Campaign ${campaignId} does not have the ${CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE.key} feature enabled`,
        );
      }

      const foundTrainings = await knexConn('trainings').whereIn('id', highlightedTrainingIds);
      const foundTrainingIds = foundTrainings.map(({ id }) => id);
      const missingTrainingIds = highlightedTrainingIds.filter((trainingId) => !foundTrainingIds.includes(trainingId));
      if (missingTrainingIds.length > 0) {
        throw new Error(`Training(s) not found in "trainings" table: ${missingTrainingIds.join(', ')}`);
      }

      await knexConn('campaign-features')
        .where({ campaignId, featureId: feature.id })
        .update({ params: { highlightedTrainingIds } });

      logger.info(`Campaign ${campaignId}: highlightedTrainingIds set to [${highlightedTrainingIds.join(', ')}]`);

      if (options.dryRun) {
        await knexConn.rollback();
        logger.info('ROLLBACK: no changes were persisted (dry run)');
        return;
      }

      logger.info('COMMIT: changes persisted');
    });
  }
}

await ScriptRunner.execute(import.meta.url, SetHighlightedTrainingsForCampaignScript);
