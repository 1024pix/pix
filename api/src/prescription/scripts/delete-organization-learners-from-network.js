import { config } from '../../../config/config.js';
import * as networkAPI from '../../organizational-entities/application/api/network-api.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { ScriptWithJob } from '../../shared/application/scripts/script-with-job.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases } from '../learner-management/domain/usecases/index.js';
import * as organizationLearnerApi from '../organization-learner/application/api/organization-learners-api.js';

export class DeleteOrganizationLearnersFromNetworkScript extends ScriptWithJob {
  constructor() {
    super({
      description:
        'Deletes organization-learners and their participations for a given networkId and older than a given date',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
        networkId: {
          type: 'number',
          describe: 'an id from a single network',
          demandOption: true,
          coerce: Number,
        },
        lastActivityDate: {
          type: 'string',
          describe: 'Delete learners which activity is older than this date',
          demandOption: true,
        },
      },
    });
  }

  async handle({ options, logger, jobClient }) {
    const engineeringUserId = config.infra.engineeringUserId;
    const lastActivityDate = new Date(options.lastActivityDate);
    const networkId = options.networkId;
    if (isNaN(lastActivityDate)) throw new Error('invalid lastActivityDate');

    const organizations = await networkAPI.findNetworkOrganizations({ networkId });
    if (organizations.length === 0) throw new Error('Network is empty');

    await super.handle({ jobClient });

    const dryRun = Boolean(options.dryRun);
    const summary = {
      networkId,
      lastActivityDate,
      dryRun,
      organizationsCount: organizations.length,
      processedOrganizationsCount: 0,
      deletedLearnersCount: 0,
      deletedLearnersByOrganization: {},
    };

    try {
      for (const { organizationId } of organizations) {
        await DomainTransaction.execute(async () => {
          const organizationLearnerIds = await organizationLearnerApi.findIdWithLastActivityDatePriorTo({
            organizationId,
            lastActivityDate,
          });

          const knexConn = DomainTransaction.getConnection();

          const combinedCourseOrganizationLearners = await knexConn('organization_learner_participations')
            .join(
              'view-active-organization-learners',
              'organization_learner_participations.organizationLearnerId',
              'view-active-organization-learners.id',
            )
            .where('type', 'COMBINED_COURSE')
            .where('organizationId', organizationId)
            .pluck('organizationLearnerId');

          const organizationLearnerIdsToDelete = organizationLearnerIds.filter(
            (id) => !combinedCourseOrganizationLearners.includes(id),
          );

          await usecases.deleteOrganizationLearners({
            organizationLearnerIds: organizationLearnerIdsToDelete,
            userId: engineeringUserId,
            organizationId,
            userRole: 'SUPER_ADMIN',
            client: 'SCRIPT',
          });

          if (dryRun) {
            await knexConn.rollback();
          }

          summary.processedOrganizationsCount++;
          if (organizationLearnerIdsToDelete.length > 0) {
            summary.deletedLearnersCount += organizationLearnerIdsToDelete.length;
            summary.deletedLearnersByOrganization[organizationId] = organizationLearnerIdsToDelete.length;
          }
        });
      }
    } finally {
      logger.info(_formatSummary(summary));
    }
  }
}

function _formatSummary({
  networkId,
  lastActivityDate,
  dryRun,
  organizationsCount,
  processedOrganizationsCount,
  deletedLearnersCount,
  deletedLearnersByOrganization,
}) {
  const details = Object.entries(deletedLearnersByOrganization)
    .map(([organizationId, count]) => `organization ${organizationId}: ${count}`)
    .join(', ');

  const sentences = [
    `Network ${networkId}, learners with last activity prior to ${lastActivityDate.toISOString().slice(0, 10)}:`,
    `${deletedLearnersCount} learners deleted, ${processedOrganizationsCount}/${organizationsCount} organizations processed.`,
    `Deleted learners by organization: ${details || 'none'}.`,
  ];
  if (dryRun) {
    sentences.unshift('[DRY RUN] ROLLBACK, no changes were persisted, remove --dryRun to persist changes.');
  }
  return sentences.join(' ');
}

await ScriptRunner.execute(import.meta.url, DeleteOrganizationLearnersFromNetworkScript);
