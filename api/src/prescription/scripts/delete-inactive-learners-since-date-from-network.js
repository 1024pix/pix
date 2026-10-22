import { config } from '../../../config/config.js';
import * as networkAPI from '../../organizational-entities/application/api/network-api.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { ScriptWithJob } from '../../shared/application/scripts/script-with-job.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases } from '../learner-management/domain/usecases/index.js';

export class DeleteInactiveLearnersSinceDateFromNetworkScript extends ScriptWithJob {
  constructor() {
    super({
      description:
        'Deletes inactive organization-learners since lastActivityDate with their participations, for a given networkId',
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
          describe: 'Delete learners if last activity is older than this date',
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

    logger.info(`Delete inactive learners since ${options.lastActivityDate} from network ${networkId}`);

    for (const { organizationId } of organizations) {
      await DomainTransaction.execute(async () => {
        const inactiveLearnerIds = await this.findInactiveLearnerIdsSinceDate({
          organizationId,
          lastActivityDate,
        });

        const learnersWithCombinedCourseParticipation = await this.findLearnersWithCombinedCourseParticipation({
          organizationId,
        });

        const organizationLearnerIdsToDelete = inactiveLearnerIds.filter(
          (id) => !learnersWithCombinedCourseParticipation.includes(id),
        );

        logger.info(`Deleting ${organizationLearnerIdsToDelete.length} learners from organization ${organizationId}`);

        await usecases.deleteOrganizationLearners({
          organizationLearnerIds: organizationLearnerIdsToDelete,
          userId: engineeringUserId,
          organizationId,
          userRole: 'SUPER_ADMIN',
          client: 'SCRIPT',
        });

        if (options.dryRun) {
          const knexConn = DomainTransaction.getConnection();
          await knexConn.rollback();
          logger.info('ROLLBACK: no changes were persisted (dry run)');
          logger.info('remove --dryRun to persist changes');
          return;
        }
      });
    }
  }

  async findInactiveLearnerIdsSinceDate({ organizationId, lastActivityDate }) {
    const knexConn = DomainTransaction.getConnection();
    return await knexConn
      .with('organizationLearnersWithLastParticipationDate', (qb) => {
        qb.select('id')
          .select(
            knexConn('campaign-participations as cp')
              .select('cp.createdAt')
              .where('cp.organizationLearnerId', knexConn.ref('view-active-organization-learners.id'))
              .orderBy('cp.createdAt', 'desc')
              .limit(1)
              .as('lastParticipationDate'),
          )
          .from('view-active-organization-learners')
          .where('organizationId', organizationId)
          .where('updatedAt', '<', lastActivityDate);
      })
      .select('*')
      .from('organizationLearnersWithLastParticipationDate')
      .where('lastParticipationDate', '<', lastActivityDate)
      .orWhereNull('lastParticipationDate')
      .orderBy('id', 'asc')
      .pluck('id');
  }

  async findLearnersWithCombinedCourseParticipation({ organizationId }) {
    const knexConn = DomainTransaction.getConnection();
    return await knexConn('organization_learner_participations')
      .join(
        'view-active-organization-learners',
        'organization_learner_participations.organizationLearnerId',
        'view-active-organization-learners.id',
      )
      .where('type', 'COMBINED_COURSE')
      .where('organizationId', organizationId)
      .pluck('organizationLearnerId');
  }
}

await ScriptRunner.execute(import.meta.url, DeleteInactiveLearnersSinceDateFromNetworkScript);
