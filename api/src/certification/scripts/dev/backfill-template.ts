import { setTimeout } from 'node:timers/promises';

import { Script } from '../../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { batchUpdate } from '../../../shared/infrastructure/utils/knex-utils.js';
import type { logger as defaultLogger } from '../../../shared/infrastructure/utils/logger.js';
import { executeInTransaction } from '../tooling/transaction.ts';

/**
 * Template for one-shot scripts that scan a whole table (backfill, retro-computation...).
 * Copy it, adapt it, then delete the script once it has been run in production.
 *
 * Pattern:
 * - Items are processed by chunks of ids: [startId, startId + chunkSize).
 *   Filtering on an id range keeps each query short, even when the "which items are concerned"
 *   condition is complex. Knex queries are killed after 30 seconds in Pix.
 * - Each chunk is written in its own transaction. On the first error, the chunk is rolled back
 *   and the script stops, logging the startId to restart from.
 * - dryRun (default: true) runs everything, then rolls back each chunk (see executeInTransaction).
 * - A throttle delay between chunks avoids overloading the production database.
 * - The upper bound (max id) is computed once at startup: items created during the run are not processed.
 */

type Options = {
  dryRun: boolean;
  throttleDelay: number;
  chunkSize: number;
  startId: number;
};

type ScriptParams = {
  command: string;
  logger: typeof defaultLogger;
  options: Options;
  dependencies?: { sleep: (delay: number) => Promise<unknown> };
};

type ItemToUpdate = {
  id: number;
  updatedAt: Date;
};

export class BackfillTemplate extends Script {
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

  async handle({ logger, options, dependencies = { sleep: setTimeout } }: ScriptParams): Promise<void> {
    const { dryRun, chunkSize, throttleDelay, startId } = options;
    logger.info(`Script execution started with options ${JSON.stringify(options)}`);
    let cntTotalItemsHandled = 0;
    let currentStartId = startId;
    // Computed once: items created during the run are not processed
    const maxId = await findMaxId();
    while (currentStartId <= maxId) {
      const itemDataToProcess = await findNextItemsToProcess(currentStartId, chunkSize);
      if (itemDataToProcess.length > 0) {
        try {
          await executeInTransaction({ dryRun }, () =>
            batchUpdate({
              schema: 'public',
              tableName: 'items',
              primaryKeyName: 'id',
              rows: itemDataToProcess,
              chunkSize,
            }),
          );
        } catch (error) {
          logger.error(
            `An error happened in batch ${currentStartId} - ${currentStartId + chunkSize - 1} : ${String(error)}`,
          );
          logger.info(`Script interrupted. Number of items processed so far : ${cntTotalItemsHandled}`);
          logger.info(`To resume, run the script again with --startId=${currentStartId}`);
          throw error;
        }
      }
      logger.info(`Batch from ${currentStartId} to ${currentStartId + chunkSize - 1} done`);
      cntTotalItemsHandled += itemDataToProcess.length;
      currentStartId += chunkSize;
      await dependencies.sleep(throttleDelay);
    }
    logger.info(`Script finished. Number of items processed : ${cntTotalItemsHandled}, youpi`);
  }
}

async function findMaxId(): Promise<number> {
  const [{ max }] = await DomainTransaction.getConnection()('items').max<{ max: number | null }[]>('id as max');
  return max ?? 0;
}

async function findNextItemsToProcess(startId: number, chunkSize: number): Promise<ItemToUpdate[]> {
  const res = await DomainTransaction.getConnection()<{ id: number }>('items')
    .select('id')
    .where('items.id', '>=', startId)
    .where('items.id', '<', startId + chunkSize)
    .orderBy('items.id', 'asc');
  return res.map((resItem) => ({
    id: resItem.id,
    updatedAt: new Date(),
  }));
}

await ScriptRunner.execute(import.meta.url, BackfillTemplate);
