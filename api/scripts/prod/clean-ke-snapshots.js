import pick from 'lodash/pick.js';

import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

const DEFAULT_CHUNK_SIZE = 10000;
const DEFAULT_PAUSE_DURATION = 2000;

const pause = async (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

function getKnowlegdeElementSnapshotsQuery() {
  return knex('knowledge-element-snapshots').whereRaw("(snapshot->0->>'answerId') is not null");
}

function getKnowlegdeElementSnapshotLimit(firstId, limit = DEFAULT_CHUNK_SIZE) {
  return getKnowlegdeElementSnapshotsQuery()
    .select('id', 'snapshot')
    .limit(limit)
    .where('id', '>=', firstId)
    .orderBy('id', 'asc');
}

function getKnowlegdeElementSnapshotCount() {
  return getKnowlegdeElementSnapshotsQuery().count({ count: 1 }).first();
}

UPDATE products
SET details = jsonb_set(details, '{specs,storage}', '"1TB SSD"')
WHERE name = 'Laptop';

// Définition du script
export class CleanKeSnapshotScript extends Script {
  constructor() {
    super({
      description: 'This script will remove unused properties from the column knowledge-element-snapshots.snapshot',
      permanent: false,
      options: {
        chunkSize: {
          type: 'number',
          default: DEFAULT_CHUNK_SIZE,
          description: 'number of records to update in one update',
        },
        pauseDuration: {
          type: 'number',
          default: DEFAULT_PAUSE_DURATION,
          description: 'Time in ms between each chunk processing',
        },
      },
    });
  }

  async handle({
    options = { chunkSize: DEFAULT_CHUNK_SIZE, pauseDuration: DEFAULT_PAUSE_DURATION },
    logger,
    dependencies = { pause },
  }) {
    const logInfo = (message) => logger.info({ event: 'CleanKeSnapshotScript' }, message);

    const snapshotToClean = await getKnowlegdeElementSnapshotCount();

    const nbChunk = Math.ceil(snapshotToClean.count / (options.chunkSize || DEFAULT_CHUNK_SIZE));

    logInfo(`Start cleaning ${snapshotToClean.count} (${nbChunk} batch) knowledge-element-snapshots to clean.`);

    let snapshots = await getKnowlegdeElementSnapshotLimit(0, options.chunkSize);
    let chunkDone = 0;

    while (snapshots.length > 0) {
      await knex.transaction(async (trx) => {
        for (const { id, snapshot } of snapshots) {
          const cleanedSnapshot = pick(snapshot, [
            'source',
            'status',
            'skillId',
            'createdAt',
            'earnedPix',
            'competenceId',
          ]);
          await trx('knowledge-element-snapshots')
            .where('id', id)
            .update({
              // we keep only these property from snapshot
              snapshot: JSON.stringify(cleanedSnapshot),
            });
        }
      });
      const lastSnapshotRow = snapshots[snapshots.length - 1];
      snapshots = await getKnowlegdeElementSnapshotLimit(lastSnapshotRow.id + 1, options.chunkSize);

      if (snapshots.length > 0 && options.pauseDuration > 0) {
        await dependencies.pause(options.pauseDuration);
      }
      chunkDone += 1;
      logInfo(`${chunkDone}/${nbChunk} chunks done !`);
    }
  }
}

// Exécution du script
await ScriptRunner.execute(import.meta.url, CleanKeSnapshotScript);
