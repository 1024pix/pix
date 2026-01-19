import { isoDateParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { Assessment } from '../../shared/domain/models/Assessment.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../shared/domain/constants.js';

const options = {
  dryRun: {
    type: 'boolean',
    describe: 'Run the script without making any database changes',
    default: true,
  },
  startDate: {
    type: 'string',
    describe: 'Start date of the period to process, day included, format "YYYY-MM-DD", (ex: "2024-01-20")',
    demandOption: true,
    requiresArg: true,
    coerce: isoDateParser(),
  },
  endDate: {
    type: 'string',
    describe: 'End date of the period to process, day included, format "YYYY-MM-DD", (ex: "2024-02-27")',
    demandOption: true,
    requiresArg: true,
    coerce: isoDateParser(),
  },
};

export class RevertCampaignParticipationsToStartedScript extends Script {
  constructor() {
    super({
      description:
        'Revert campaign participations from TO_SHARE to STARTED status and update their last assessment state from completed to started',
      permanent: false,
      options,
    });
  }

  async handle({ logger, options }) {
    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();

      logger.info('BEGIN: RevertCampaignParticipationsToStartedScript');
      logger.info(
        `Processing participations from ${options.startDate.toISOString()} to ${options.endDate.toISOString()}`,
      );

      const participationsToUpdate = await this.#fetchParticipationsToUpdate(
        knexConn,
        options.startDate,
        options.endDate,
      );

      if (participationsToUpdate.length === 0) {
        logger.info('No participations found to update');
        return;
      }

      logger.info(`Found ${participationsToUpdate.length} participations to update`);

      let updatedParticipationsCount = 0;
      let updatedAssessmentsCount = 0;

      for (const participation of participationsToUpdate) {
        logger.info(`Processing participation id: ${participation.id}`);

        logger.info(`Participation is of type: ${participation.type}`);

        if (participation.deletedAt) {
          logger.info(`Participation has been deleted at: ${participation.deletedAt}`);
        }

        logger.info(`Updating participation id: ${participation.id} status from TO_SHARE to STARTED`);

        await knexConn('campaign-participations')
          .where({ id: participation.id })
          .update({ status: CampaignParticipationStatuses.STARTED });

        updatedParticipationsCount++;

        if (participation.type === CampaignTypes.PROFILES_COLLECTION) {
          logger.info('Participation is of type PROFILES_COLLECTION, skipping assessment update');
          continue;
        }

        if (participation.deletedAt) {
          logger.info('Participation has been deleted, skipping assessment update');
          continue;
        }

        const lastAssessment = await this.#fetchLastAssessmentForParticipation(knexConn, participation.id);

        if (!lastAssessment) {
          logger.warn(`No assessment found for participation id: ${participation.id}, skipping`);
          continue;
        }

        if (lastAssessment.state !== Assessment.states.COMPLETED) {
          logger.warn(
            `Last assessment id: ${lastAssessment.id} for participation id: ${participation.id} is not in completed state (current state: ${lastAssessment.state}), skipping`,
          );
          continue;
        }

        logger.info(`Updating assessment id: ${lastAssessment.id} state from completed to started`);

        await knexConn('assessments').where({ id: lastAssessment.id }).update({ state: Assessment.states.STARTED });

        updatedAssessmentsCount++;
      }

      logger.info(`Updated ${updatedParticipationsCount} participations`);
      logger.info(`Updated ${updatedAssessmentsCount} assessments`);

      if (options.dryRun) {
        await knexConn.rollback();
        logger.info('ROLLBACK: RevertCampaignParticipationsToStartedScript (dry run mode)');
        logger.info('Use --dryRun=false to persist changes');
        return;
      }

      logger.info('COMMIT: RevertCampaignParticipationsToStartedScript');
    });
  }

  async #fetchParticipationsToUpdate(knexConn, startDate, endDate) {
    const formattedStartDate = startDate.toISOString().split('T')[0];

    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    const formattedEndDate = adjustedEndDate.toISOString().split('T')[0];

    return knexConn('campaign-participations')
      .select('campaign-participations.id', 'campaigns.type', 'campaign-participations.deletedAt')
      .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
      .where('status', CampaignParticipationStatuses.TO_SHARE)
      .where('campaign-participations.createdAt', '>=', formattedStartDate)
      .where('campaign-participations.createdAt', '<', formattedEndDate);
  }

  async #fetchLastAssessmentForParticipation(knexConn, campaignParticipationId) {
    return knexConn('assessments')
      .select('id', 'state')
      .where({ campaignParticipationId })
      .orderBy('createdAt', 'desc')
      .first();
  }
}

await ScriptRunner.execute(import.meta.url, RevertCampaignParticipationsToStartedScript);
