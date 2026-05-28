import { knex } from '../../../db/knex-database-connection.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { CLIENTS, PIX_ADMIN } from '../../shared/domain/constants.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases } from '../campaign-participation/domain/usecases/index.js';

export class DeleteAndAnonymisePreviousCampaignParticipationsScript extends Script {
  constructor() {
    super({
      description:
        'Update deleted participations and anonymise their related data not related to archived organization or deleted learner',
      permanent: false,
      options: {
        startArchiveDate: {
          type: 'date',
          describe: 'date to start anonymisation',
          demandOption: true,
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
    const engineeringUserId = process.env.ENGINEERING_USER_ID;

    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();
      logger.info(
        `BEGIN: Update deleted participations... on active campaigns not related on deleted learner or archived organizations before ${options.startArchiveDate}`,
      );

      try {
        const subQueryOrganizationIds = knexConn('organizations')
          .select('id')
          .where('archivedAt', '<', options.startArchiveDate);

        const subQueryCampaignIds = knexConn('campaigns')
          .select('id')
          .whereNull('deletedAt')
          .whereNotIn('organizationId', subQueryOrganizationIds);

        const campaignParticipationIdsOnCampaigns = await knexConn('campaign-participations')
          .select({
            campaignId: 'campaignId',
            organizationLearnerId: 'organizationLearnerId',
            campaignParticipationId: 'campaign-participations.id',
          })
          .join('organization-learners', function () {
            this.on('organization-learners.id', 'campaign-participations.organizationLearnerId').andOnVal(
              'organization-learners.deletedAt',
              knex.raw('IS'),
              knex.raw('NULL'),
            );
          })
          .whereIn('campaignId', subQueryCampaignIds)
          .where('campaign-participations.deletedAt', '<', options.startArchiveDate)
          .where('isImproved', false)
          .whereNotNull('campaign-participations.deletedAt');

        if (campaignParticipationIdsOnCampaigns.length > 0) {
          logger.info(`Processing :${campaignParticipationIdsOnCampaigns.length} for active campaigns`);

          for (const campaignParticipationIdsOnCampaign of campaignParticipationIdsOnCampaigns) {
            logger.info(
              `deleted participations :${campaignParticipationIdsOnCampaign.campaignParticipationId} to update on campaign ${campaignParticipationIdsOnCampaign.campaignId}`,
            );

            await usecases.deleteCampaignParticipation({
              userId: engineeringUserId,
              campaignParticipationId: campaignParticipationIdsOnCampaign.campaignParticipationId,
              campaignId: campaignParticipationIdsOnCampaign.campaignId,
              userRole: PIX_ADMIN.ROLES.SUPER_ADMIN,
              client: CLIENTS.SCRIPT,
              keepPreviousDeleted: true,
            });
          }
        }

        if (options.dryRun) {
          await knexConn.rollback();
          logger.info(
            `ROLLBACK: anonymise deleted participations... not related to archived organization before or deleted learner`,
          );
          logger.info(`--dryRun true to persist changes`);
          return;
        }

        logger.info(
          `COMMIT: anonymise deleted participations... not related to archived organization before  or deleted learner`,
        );
      } catch (error) {
        await knexConn.rollback();
        logger.error(
          { error },
          `ERROR: anonymise deleted participations... not related to archived organization before  or deleted learner`,
        );
        throw error;
      }
    });
  }
}

await ScriptRunner.execute(import.meta.url, DeleteAndAnonymisePreviousCampaignParticipationsScript);
