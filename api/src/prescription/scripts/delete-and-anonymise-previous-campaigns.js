import { knex } from '../../../db/knex-database-connection.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { CLIENTS, PIX_ADMIN } from '../../shared/domain/constants.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases as campaignUsecases } from '../campaign/domain/usecases/index.js';

export class DeleteAndAnonymisePreviousCampaignsScript extends Script {
  constructor() {
    super({
      description: 'Deletes campaigns and anonymise their related data',
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
        `BEGIN: Update Deleted campaigns, participations... on deleted campaigns not belong to archived organizations before ${options.startArchiveDate}`,
      );

      try {
        const organizationIds = await knexConn('organizations')
          .where('archivedAt', '<', options.startArchiveDate)
          .pluck('id');

        const campaignIdsOnOrganizations = await knexConn('campaigns')
          .select({
            organizationId: 'campaigns.organizationId',
            campaignIds: knex.raw(`array_agg("campaigns".id)`),
          })
          .whereNotIn('organizationId', organizationIds)
          .where('deletedAt', '<', options.startArchiveDate)
          .whereNotNull('deletedAt')
          .groupBy('campaigns.organizationId');

        if (campaignIdsOnOrganizations) {
          logger.info(`unArchived Organization :${campaignIdsOnOrganizations.length} for deleted campaigns`);

          for (const campaignIdsOnOrganization of campaignIdsOnOrganizations) {
            logger.info(
              `campaigns :${campaignIdsOnOrganization.campaignIds.length} to delete on organization ${campaignIdsOnOrganization.organizationId}`,
            );
            await campaignUsecases.deleteCampaigns({
              organizationId: campaignIdsOnOrganization.organizationId,
              campaignIds: campaignIdsOnOrganization.campaignIds,
              userId: engineeringUserId,
              keepPreviousDeletion: true,
              userRole: PIX_ADMIN.ROLES.SUPER_ADMIN,
              client: CLIENTS.SCRIPT,
            });
          }
        }

        if (options.dryRun) {
          await knexConn.rollback();
          logger.info(`ROLLBACK: Delete and anonymise campaigns, participations... on active organizations`);
          logger.info(`--dryRun true to persist changes`);
          return;
        }

        logger.info(`COMMIT: Delete and anonymise campaigns, participations... on active organizations`);
      } catch (error) {
        await knexConn.rollback();
        throw error;
      }
    });
  }
}

await ScriptRunner.execute(import.meta.url, DeleteAndAnonymisePreviousCampaignsScript);
