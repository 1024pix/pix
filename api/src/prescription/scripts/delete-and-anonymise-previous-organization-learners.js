import { knex } from '../../../db/knex-database-connection.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { CLIENTS, PIX_ADMIN } from '../../shared/domain/constants.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases as learnerManagementUsecases } from '../learner-management/domain/usecases/index.js';

export class DeleteAndAnonymisePreviousOrganizationLearnersScript extends Script {
  constructor() {
    super({
      description: 'Deletes organization-learners and anonymize their related data',
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
        `BEGIN: Update deleted organization learners before ${options.startArchiveDate} not in archived organizations before ${options.startArchiveDate}`,
      );

      try {
        const organizationIds = await knexConn('organizations')
          .where('archivedAt', '<', options.startArchiveDate)
          .pluck('id');

        const organizationLearnerIdsOnOrganizations = await knexConn('organization-learners')
          .select({
            organizationId: 'organizationId',
            organizationLearnerIds: knex.raw(`array_agg(id)`),
          })
          .whereNotIn('organizationId', organizationIds)
          .where('deletedAt', '<', options.startArchiveDate)
          .whereNotNull('deletedAt')
          .groupBy('organizationId');

        if (organizationLearnerIdsOnOrganizations?.length > 0) {
          logger.info(`Found :${organizationLearnerIdsOnOrganizations.length} organizations with deleted learners`);

          for (const organizationLearnerIdsOnOrganization of organizationLearnerIdsOnOrganizations) {
            logger.info(
              `Processing :${organizationLearnerIdsOnOrganization.organizationLearnerIds.length} learners for organization ${organizationLearnerIdsOnOrganization.organizationId}`,
            );

            await learnerManagementUsecases.deleteOrganizationLearners({
              organizationLearnerIds: organizationLearnerIdsOnOrganization.organizationLearnerIds,
              userId: engineeringUserId,
              organizationId: organizationLearnerIdsOnOrganization.organizationId,
              userRole: PIX_ADMIN.ROLES.SUPER_ADMIN,
              client: CLIENTS.SCRIPT,
              keepPreviousDeletion: true,
            });
          }
        }

        if (options.dryRun) {
          await knexConn.rollback();
          logger.info(
            `ROLLBACK: Anonymise deleted learners with participations, assessment... not on archived organizations before date`,
          );
          logger.info(`--dryRun false to persist changes`);
          return;
        }

        logger.info(
          `COMMIT: Anonymise deleted learners with participations, assessment... not on archived organizations before date`,
        );
      } catch (error) {
        await knexConn.rollback();
        throw error;
      }
    });
  }
}

await ScriptRunner.execute(import.meta.url, DeleteAndAnonymisePreviousOrganizationLearnersScript);
