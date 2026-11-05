import { setTimeout } from 'node:timers/promises';

import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { batchUpdate } from '../../shared/infrastructure/utils/knex-utils.js';

const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_THROTTLE_DELAY = 300;

export class FixArbitraryOrganizationLearnerUpdatedAtScript extends Script {
  constructor() {
    super({
      description:
        'Fixes the createdAt & updatedAt of organization-learners with their first participation date, for learners with arbitrary createdAt & updatedAt',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
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

  // Avec cette requête SQL on va :
  // Mettre à jour le createdAt & updatedAt d'un learner avec sa date de participation la plus ancienne
  // Pour tous les learners qui ont une participation plus ancienne que leur createdAt & updatedAt
  // Avec un createdAt & updatedAt le 23 février 2022 entre minuit et 23h59 9h et 15h59 (plage de lancement du script création de learners pour décrocher les infos des users)

  // ---------------------------------------------------------------------------------

  // Comme ça leur createdAt & updatedAt reflèteront la date de leur première activité réelle
  // Et ainsi le script de purge pourra correctement les inclure

  // ---------------------------------------------------------------------------------

  // Nombre de learners qui seront concernés par cette requête : 948 660
  // 948 598

  async findOrganizationLearnersWithArbitraryUpdatedAt({ idOffset, batchSize }) {
    const dateRange = ['2022-02-23T09:00:00.000000+01:00', '2022-02-23T15:59:59.999999+01:00'];

    const knexConn = DomainTransaction.getConnection();

    return await knexConn('view-active-organization-learners as vaol')
      .select({ organizationLearnerId: 'vaol.id' })
      .min('cp.createdAt as firstParticipationDate')
      .join('campaign-participations as cp', 'cp.organizationLearnerId', 'vaol.id')
      .whereNotNull('vaol.lastName')
      .whereBetween('vaol.updatedAt', dateRange)
      .whereBetween('vaol.createdAt', dateRange)
      .where('cp.createdAt', '<', '2022-02-23')
      .where('vaol.id', '>', idOffset)
      .groupBy('vaol.id')
      .orderBy('vaol.id')
      .limit(batchSize);
  }

  async handle({ options, logger }) {
    const { batchSize, throttleDelay } = options;

    let batchNumber = 0;
    let updatedLearnersCount = 0;
    let lastComputedOrganizationLearnerId = 0;

    while (true) {
      const learnersToUpdate = await this.findOrganizationLearnersWithArbitraryUpdatedAt({
        idOffset: lastComputedOrganizationLearnerId,
        batchSize,
      });
      if (learnersToUpdate.length === 0) break;

      lastComputedOrganizationLearnerId = learnersToUpdate[learnersToUpdate.length - 1].organizationLearnerId;

      logger.info(`Batch #${++batchNumber}: ${learnersToUpdate.length} learners to update`);

      updatedLearnersCount += learnersToUpdate.length;

      const learnersToUpdate = await this.findOrganizationLearnersWithArbitraryUpdatedAt({
        startId: currentStartId,
        endId: currentEndId,
      });

      logger.info(
        `Batch #${++batchNumber} (ids ${currentStartId} - ${currentEndId}): ${learnersToUpdate.length} learners to update`,
      );

      currentStartId = currentEndId + 1;

      if (learnersToUpdate.length === 0) continue;

      await DomainTransaction.execute(async () => {
        const knexConn = DomainTransaction.getConnection();

        await batchUpdate({
          tableName: 'organization-learners',
          primaryKeyName: 'id',
          rows: learnersToUpdate.map(({ organizationLearnerId, firstParticipationDate }) => ({
            id: organizationLearnerId,
            createdAt: firstParticipationDate,
            updatedAt: firstParticipationDate,
          })),
          chunkSize: batchSize,
        });

        if (options.dryRun) {
          await knexConn.rollback();
        }
      });

      await setTimeout(throttleDelay);
    }

    logger.info(`${updatedLearnersCount} learners ${options.dryRun ? 'to update' : 'updated'}`);

    if (options.dryRun) {
      logger.info('ROLLBACK: no changes were persisted (dry run)');
      logger.info('change to --dryRun=false to persist changes');
    }
  }
}

await ScriptRunner.execute(import.meta.url, FixArbitraryOrganizationLearnerUpdatedAtScript);
