import { setTimeout } from 'node:timers/promises';

import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { batchUpdate } from '../../shared/infrastructure/utils/knex-utils.js';

const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_THROTTLE_DELAY = 300;
const DEFAULT_START_ID = 22650044;
const DEFAULT_END_ID = 23783593;

const ARBITRARY_DATE_RANGE = ['2022-02-23T09:00:00.000000+01:00', '2022-02-23T15:59:59.999999+01:00'];

export class FixArbitraryOrganizationLearnerUpdatedAtScript extends Script {
  constructor() {
    super({
      description:
        'Fixes the createdAt & updatedAt of organization-learners with their first participation date, for learners with arbitrary createdAt & updatedAt',
      permanent: false,
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
        startId: {
          type: 'number',
          describe: 'ID of the first organization-learner to scan',
          default: DEFAULT_START_ID,
        },
        endId: {
          type: 'number',
          describe: 'ID of the last organization-learner to scan',
          default: DEFAULT_END_ID,
        },
      },
    });
  }

  // Avec cette requête SQL on va :
  // Mettre à jour le createdAt & updatedAt d'un learner avec sa date de participation la plus ancienne
  // Pour tous les learners qui ont une participation plus ancienne que leur createdAt & updatedAt
  // Avec un createdAt & updatedAt le 23 février 2022 entre 9h et 15h59 (plage de lancement du script création de learners pour décrocher les infos des users)

  // ---------------------------------------------------------------------------------

  // Comme ça leur createdAt & updatedAt reflèteront la date de leur première activité réelle
  // Et ainsi le script de purge pourra correctement les inclure

  // ---------------------------------------------------------------------------------

  // Les learners concernés ont des ids compris entre 22650044 et 23783593 (créés par le script de 2022)
  // On parcourt donc cette plage par tranches d'ids : chaque batch est un range scan borné sur la clé primaire
  // Nombre de learners qui seront concernés par cette requête : 948 598

  async findOrganizationLearnersWithArbitraryUpdatedAt({ startId, endId }) {
    const knexConn = DomainTransaction.getConnection();

    return await knexConn('view-active-organization-learners as vaol')
      .select({ organizationLearnerId: 'vaol.id' })
      .min('cp.createdAt as firstParticipationDate')
      .join('campaign-participations as cp', 'cp.organizationLearnerId', 'vaol.id')
      .whereBetween('vaol.id', [startId, endId])
      .whereNot('vaol.lastName', '')
      .whereBetween('vaol.updatedAt', ARBITRARY_DATE_RANGE)
      .whereBetween('vaol.createdAt', ARBITRARY_DATE_RANGE)
      .where('cp.createdAt', '<', ARBITRARY_DATE_RANGE[0])
      .groupBy('vaol.id')
      .orderBy('vaol.id');
  }

  async handle({ options, logger }) {
    const { dryRun, batchSize, throttleDelay, startId, endId } = options;
    logger.info(`Script execution started with options ${JSON.stringify(options)}`);

    let batchNumber = 0;
    let updatedLearnersCount = 0;
    let currentStartId = startId;

    while (currentStartId <= endId) {
      const currentEndId = Math.min(currentStartId + batchSize - 1, endId);

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

        updatedLearnersCount += learnersToUpdate.length;

        if (dryRun) {
          await DomainTransaction.getConnection().rollback();
        }
      });

      await setTimeout(throttleDelay);
    }

    logger.info(`${updatedLearnersCount} learners ${dryRun ? 'would have been updated' : 'updated'}`);

    if (dryRun) {
      logger.info('ROLLBACK: no changes were persisted (dry run)');
      logger.info('change to --dryRun=false to persist changes');
    }
  }
}

await ScriptRunner.execute(import.meta.url, FixArbitraryOrganizationLearnerUpdatedAtScript);
