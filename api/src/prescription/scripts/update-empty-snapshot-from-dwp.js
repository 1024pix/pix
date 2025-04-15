import pick from 'lodash/pick.js';

import { knex as datawarehouseKnex } from '../../../datawarehouse/knex-database-connection.js';
import { knex } from '../../../db/knex-database-connection.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
const DEFAULT_CHUNK_SIZE = 10000;
const DEFAULT_PAUSE_DURATION = 2000;

const pause = async (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

function getKnowlegdeElementSnapshotLimit(firstId, lastId, limit = DEFAULT_CHUNK_SIZE) {
  return datawarehouseKnex('knowledge-element-snapshots')
    .select('id', 'snapshot')
    .where('id', '>=', firstId)
    .where('id', '<=', lastId)
    .limit(limit)
    .orderBy('id', 'asc');
}

// Définition du script
export class UpdateEmptyKeSnapshotScript extends Script {
  constructor() {
    super({
      description: 'This script will copy knowledge-element-snapshots.snapshot from datawarehouse db to prod db',
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
        firstId: {
          type: 'number',
          default: 0,
          describe: 'first knowledge-element-snapshot id with empty snapshot',
        },
        lastId: {
          type: 'number',
          default: 21673844,
          describe: 'last knowledge-element-snapshot id with empty snapshot',
        },
      },
    });
  }

  async handle({
    options = {
      chunkSize: DEFAULT_CHUNK_SIZE,
      pauseDuration: DEFAULT_PAUSE_DURATION,
      firstId: 0,
      lastId: 21673845,
    },
    logger,
    dependencies = { pause },
  }) {
    const logInfo = (message) => logger.info({ event: 'UpdateEmptyKeSnapshotScript' }, message);
    logInfo(`Start fixing knowledge-element-snapshots empty snapshots.`);
    let keSnapshots = await getKnowlegdeElementSnapshotLimit(options.firstId, options.lastId, options.chunkSize);

    while (keSnapshots.length > 0) {
      await knex.transaction(async (trx) => {
        for (const { id, snapshot } of keSnapshots) {
          const cleanedSnapshot = snapshot.map((item) =>
            pick(item, ['source', 'status', 'skillId', 'createdAt', 'earnedPix', 'competenceId']),
          );
          await trx('knowledge-element-snapshots')
            .where('id', id)
            .whereRaw("snapshot = '[]'")
            .update({
              // we keep only these property from snapshot
              snapshot: JSON.stringify(cleanedSnapshot),
            });
        }
      });
      logInfo(`updated ${keSnapshots.length} knowledge-element-snapshots rows with empty snapshots.`);
      const lastKeSnapshotRow = keSnapshots[keSnapshots.length - 1];
      keSnapshots = await getKnowlegdeElementSnapshotLimit(lastKeSnapshotRow.id + 1, options.lastId, options.chunkSize);
      if (keSnapshots.length > 0 && options.pauseDuration > 0) {
        await dependencies.pause(options.pauseDuration);
      }
    }
  }
}

// Exécution du script
await ScriptRunner.execute(import.meta.url, UpdateEmptyKeSnapshotScript);
