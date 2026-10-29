import { setTimeout } from 'node:timers/promises';

import { config } from '../../../config/config.js';
import * as networkAPI from '../../organizational-entities/application/api/network-api.js';
import { commaSeparatedNumberParser } from '../../shared/application/scripts/parsers.js';
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
          describe: 'id of network to purge',
          demandOption: false,
          coerce: Number,
        },
        organizationIds: {
          type: 'string',
          describe: 'a list of comma separated organization ids to purge',
          demandOption: false,
          coerce: commaSeparatedNumberParser(),
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
    const { networkId, organizationIds, batchSize, throttleDelay } = options;

    if (isNaN(lastActivityDate)) throw new Error('invalid lastActivityDate');

    const noOrganization = !organizationIds || organizationIds?.length === 0;

    if (!networkId && noOrganization) throw new Error('No network or organization in script params');

    let organizations;

    // For a network
    if (networkId) {
      organizations = await networkAPI.findNetworkOrganizations({ networkId });
      if (organizations.length === 0) throw new Error('Network is empty');
      logger.info(`Delete inactive learners since ${options.lastActivityDate} from network ${networkId}`);
    }
    // For a list of organizations
    else {
      const nonExistingOrganizationIds = await this.findNonExistingOrganizationIds({ organizationIds });
      if (nonExistingOrganizationIds.length > 0)
        throw new Error(`Non existing organization(s): ${nonExistingOrganizationIds.toString()}`);

      organizations = organizationIds.map((id) => {
        return { organizationId: id };
      });
      logger.info(
        `Delete inactive learners since ${options.lastActivityDate} from organizations ${organizationIds.toString()}`,
      );
    }

    await super.handle({ jobClient });

    for (const { organizationId } of organizations) {
      let batchNumber = 0;
      let lastLearnerIdComputed = 0;
      let countDeletedLearners = 0;

      while (true) {
        const inactiveLearnerIds = await this.findInactiveLearnerIdsWithoutCombinedCourseParticipationSinceDate({
          organizationId,
          lastActivityDate,
          batchSize,
          idOffset: lastLearnerIdComputed,
        });
        if (inactiveLearnerIds.length === 0) break;

        lastLearnerIdComputed = inactiveLearnerIds[inactiveLearnerIds.length - 1];

        logger.info(`Batch #${++batchNumber}: ${inactiveLearnerIds.length} inactive learners to delete`);

        countDeletedLearners += inactiveLearnerIds.length;

        await DomainTransaction.execute(async () => {
          await usecases.deleteOrganizationLearners({
            organizationLearnerIds: inactiveLearnerIds,
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
        `${countDeletedLearners} inactive learners ${options.dryRun ? 'to delete' : 'deleted'} from organization ${organizationId}`,
      );
    }
    if (options.dryRun) {
      logger.info('ROLLBACK: no changes were persisted (dry run)');
      logger.info('change to --dryRun=false to persist changes');
    }
  }

  async findInactiveLearnerIdsWithoutCombinedCourseParticipationSinceDate({
    organizationId,
    lastActivityDate,
    batchSize,
    idOffset = 0,
  }) {
    const knexConn = DomainTransaction.getConnection();
    return await knexConn
      .with('organizationLearnersWithLastParticipationDate', (qb) => {
        qb.select('view-active-organization-learners.id')
          .select(
            knexConn('campaign-participations as cp')
              .select('cp.createdAt')
              .where('cp.organizationLearnerId', knexConn.ref('view-active-organization-learners.id'))
              .orderBy('cp.createdAt', 'desc')
              .limit(1)
              .as('lastParticipationDate'),
          )
          .from('view-active-organization-learners')
          .leftJoin(
            'organization_learner_participations',
            'view-active-organization-learners.id',
            'organization_learner_participations.organizationLearnerId',
          )
          .whereNull('organization_learner_participations.id')
          .where('view-active-organization-learners.id', '>', idOffset)
          .where('view-active-organization-learners.organizationId', organizationId)
          .where('view-active-organization-learners.updatedAt', '<', lastActivityDate)
          .orderBy('view-active-organization-learners.id', 'asc')
          .limit(batchSize);
      })
      .select('*')
      .from('organizationLearnersWithLastParticipationDate')
      .where('lastParticipationDate', '<', lastActivityDate)
      .orWhereNull('lastParticipationDate')
      .orderBy('id', 'asc')
      .pluck('id');
  }

  async findNonExistingOrganizationIds({ organizationIds }) {
    const knexConn = DomainTransaction.getConnection();
    const existingOrganizations = await knexConn('organizations').whereIn('id', organizationIds).pluck('id');
    const nonExistingOrganizations = organizationIds.filter((id) => !existingOrganizations.includes(id));
    return nonExistingOrganizations;
  }
}

await ScriptRunner.execute(import.meta.url, DeleteInactiveLearnersSinceDateFromNetworkScript);
