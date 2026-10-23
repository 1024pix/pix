import { setTimeout } from 'node:timers/promises';

import { config } from '../../../config/config.js';
import * as networkAPI from '../../organizational-entities/application/api/network-api.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { ScriptWithJob } from '../../shared/application/scripts/script-with-job.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases } from '../learner-management/domain/usecases/index.js';

const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_THROTTLE_DELAY = 300;

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
        batchSize: {
          type: 'number',
          describe: 'Size of the batch to process',
          default: DEFAULT_BATCH_SIZE,
        },
        throttleDelay: {
          type: 'number',
          describe: 'Delay between batches in milliseconds',
          default: DEFAULT_THROTTLE_DELAY,
        },
      },
    });
  }

  async handle({ options, logger, jobClient }) {
    const engineeringUserId = config.infra.engineeringUserId;
    const lastActivityDate = new Date(options.lastActivityDate);
    const { networkId, batchSize, throttleDelay } = options;

    if (isNaN(lastActivityDate)) throw new Error('invalid lastActivityDate');

    const organizations = await networkAPI.findNetworkOrganizations({ networkId });
    if (organizations.length === 0) throw new Error('Network is empty');

    await super.handle({ jobClient });

    logger.info(`Delete inactive learners since ${options.lastActivityDate} from network ${networkId}`);

    for (const { organizationId } of organizations) {
      let batchNumber = 0;
      let inactiveLearnersCount = 0;

      while (true) {
        // once deleted, learners are not in this request results anymore, so no offset is needed
        const inactiveLearnerIds = await this.findInactiveLearnerIdsSinceDate({
          organizationId,
          lastActivityDate,
          limit: batchSize,
        });
        if (inactiveLearnerIds.length === 0) break;

        logger.info(`Batch #${++batchNumber}: ${inactiveLearnerIds.length} inactive learners`);

        const learnersWithCombinedCourseParticipation = await this.findLearnersWithCombinedCourseParticipation({
          organizationLearnerIds: inactiveLearnerIds,
        });

        const organizationLearnerIdsToDelete = inactiveLearnerIds.filter(
          (id) => !learnersWithCombinedCourseParticipation.includes(id),
        );

        inactiveLearnersCount += organizationLearnerIdsToDelete.length;

        await DomainTransaction.execute(async () => {
          await usecases.deleteOrganizationLearners({
            organizationLearnerIds: organizationLearnerIdsToDelete,
            userId: engineeringUserId,
            organizationId,
            userRole: 'SUPER_ADMIN',
            client: 'SCRIPT',
            disableAuditLogger: options.dryRun,
          });

          if (options.dryRun) {
            const knexConn = DomainTransaction.getConnection();
            await knexConn.rollback();
          }
        });

        await setTimeout(throttleDelay);
      }

      logger.info(
        `${inactiveLearnersCount} inactive learners ${options.dryRun ? 'to delete' : 'deleted'} from organization ${organizationId}`,
      );
    }
    if (options.dryRun) {
      logger.info('ROLLBACK: no changes were persisted (dry run)');
      logger.info('remove --dryRun to persist changes');
    }
  }

  async findInactiveLearnerIdsSinceDate({ organizationId, lastActivityDate, limit }) {
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
      .limit(limit)
      .pluck('id');
  }

  async findLearnersWithCombinedCourseParticipation({ organizationLearnerIds }) {
    const knexConn = DomainTransaction.getConnection();
    return await knexConn('organization_learner_participations')
      .join(
        'view-active-organization-learners',
        'organization_learner_participations.organizationLearnerId',
        'view-active-organization-learners.id',
      )
      .where('type', 'COMBINED_COURSE')
      .whereIn('view-active-organization-learners.id', organizationLearnerIds)
      .pluck('organizationLearnerId');
  }
}

await ScriptRunner.execute(import.meta.url, DeleteInactiveLearnersSinceDateFromNetworkScript);
