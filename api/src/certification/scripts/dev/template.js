import { setTimeout } from 'node:timers/promises';

import { knex } from '../../../../db/knex-database-connection.js';
import { Script } from '../../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { batchUpdate } from '../../../shared/infrastructure/utils/knex-utils.js';

export class TemplateCertif extends Script {
  constructor() {
    super({
      description: 'Template script to scan a whole table to retro-compute stuff',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
        throttleDelay: {
          type: 'number',
          describe: 'The throttle delay',
          default: 200,
        },
        chunkSize: {
          type: 'number',
          describe: 'Number of items handled by chunk',
          default: 2000,
        },
        startId: {
          type: 'number',
          describe: 'ID of the item on which we start the process',
          default: 1,
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun, chunkSize, throttleDelay, startId } = options;
    logger.info(`Script execution started with options ${JSON.stringify(options)}`);
    let cntTotalItemsHandled = 0;
    let currentStartId = startId;
    const [{ max }] = await knex('items').max('id');
    let itemDataToProcess = await findNextItemsToProcess(currentStartId, chunkSize);
    while (currentStartId <= max) {
      try {
        await DomainTransaction.execute(async () => {
          if (itemDataToProcess.length > 0) {
            await batchUpdate({
              schema: 'public',
              tableName: 'items',
              primaryKeyName: 'id',
              rows: itemDataToProcess,
              chunkSize,
            });
            if (dryRun) {
              throw new Error('DRYRUN');
            }
          }
        });
      } catch (error) {
        if (!error?.message?.includes('DRYRUN')) {
          logger.error(`An error happened in batch ${currentStartId} - ${currentStartId + chunkSize - 1} : ${error}`);
          logger.info(`Script interrupted. Number of items processed so far : ${cntTotalItemsHandled}`);
          throw error;
        }
      }
      logger.info(`Batch from ${currentStartId} to ${currentStartId + chunkSize - 1} done`);
      cntTotalItemsHandled += itemDataToProcess.length;
      currentStartId += chunkSize;
      itemDataToProcess = await findNextItemsToProcess(currentStartId, chunkSize);
      await setTimeout(throttleDelay);
    }
    logger.info(`Script finished. Number of items processed : ${cntTotalItemsHandled}, youpi`);
  }
}

async function findNextItemsToProcess(startId, chunkSize) {
  const res = knex('items').select('*').where('items.id', '>=', startId).orderBy('items.id', 'asc').limit(chunkSize);
  return res.map((resItem) => ({
    id: resItem.id,
    updatedAt: new Date(),
  }));
}

await ScriptRunner.execute(import.meta.url, TemplateCertif);
