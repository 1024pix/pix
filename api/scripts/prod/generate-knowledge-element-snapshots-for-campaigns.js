import * as url from 'node:url';

import yargs from 'yargs';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import * as knowledgeElementRepository from '../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as knowledgeElementSnapshotRepository from '../../lib/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { AlreadyExistingEntityError } from '../../src/shared/domain/errors.js';
import { PromiseUtils } from '../../src/shared/infrastructure/utils/promise-utils.js';

const DEFAULT_MAX_SNAPSHOT_COUNT = 5000;
const DEFAULT_CONCURRENCY = 3;

function _validateAndNormalizeMaxSnapshotCount(maxSnapshotCount) {
  if (isNaN(maxSnapshotCount)) {
    maxSnapshotCount = DEFAULT_MAX_SNAPSHOT_COUNT;
  }
  if (maxSnapshotCount <= 0 || maxSnapshotCount > 50000) {
    throw new Error(`Nombre max de snapshots ${maxSnapshotCount} ne peut pas être inférieur à 1 ni supérieur à 50000.`);
  }

  return maxSnapshotCount;
}

function _validateAndNormalizeConcurrency(concurrency) {
  if (isNaN(concurrency)) {
    concurrency = DEFAULT_CONCURRENCY;
  }
  if (concurrency <= 0 || concurrency > 10) {
    throw new Error(`Concurrent ${concurrency} ne peut pas être inférieur à 1 ni supérieur à 10.`);
  }

  return concurrency;
}

function _validateAndNormalizeArgs({ concurrency, maxSnapshotCount }) {
  const finalMaxSnapshotCount = _validateAndNormalizeMaxSnapshotCount(maxSnapshotCount);
  const finalConcurrency = _validateAndNormalizeConcurrency(concurrency);

  return {
    maxSnapshotCount: finalMaxSnapshotCount,
    concurrency: finalConcurrency,
  };
}

async function getEligibleCampaignParticipations(maxSnapshotCount) {
  return knex('campaign-participations')
    .select('campaign-participations.userId', 'campaign-participations.sharedAt')
    .leftJoin('knowledge-element-snapshots', function () {
      this.on('knowledge-element-snapshots.userId', 'campaign-participations.userId').andOn(
        'knowledge-element-snapshots.snappedAt',
        'campaign-participations.sharedAt',
      );
    })
    .whereNotNull('campaign-participations.sharedAt')
    .where((qb) => {
      qb.whereNull('knowledge-element-snapshots.snappedAt').orWhereRaw('?? != ??', [
        'campaign-participations.sharedAt',
        'knowledge-element-snapshots.snappedAt',
      ]);
    })
    .orderBy('campaign-participations.userId')
    .limit(maxSnapshotCount);
}

async function generateKnowledgeElementSnapshots(
  campaignParticipationData,
  concurrency,
  dependencies = { knowledgeElementRepository, knowledgeElementSnapshotRepository },
) {
  return PromiseUtils.map(
    campaignParticipationData,
    async (campaignParticipation) => {
      const { userId, sharedAt } = campaignParticipation;
      const knowledgeElements = await dependencies.knowledgeElementRepository.findUniqByUserId({
        userId,
        limitDate: sharedAt,
      });
      try {
        await dependencies.knowledgeElementSnapshotRepository.save({ userId, snappedAt: sharedAt, knowledgeElements });
      } catch (err) {
        if (!(err instanceof AlreadyExistingEntityError)) {
          throw err;
        }
      }
    },
    { concurrency },
  );
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const commandLineArgs = yargs
    .option('maxSnapshotCount', {
      description: 'Nombre de snapshots max. à générer.',
      type: 'number',
      default: DEFAULT_MAX_SNAPSHOT_COUNT,
    })
    .option('concurrency', {
      description: 'Concurrence',
      type: 'number',
      default: DEFAULT_CONCURRENCY,
    })
    .help().argv;
  const { maxSnapshotCount, concurrency } = _validateAndNormalizeArgs(commandLineArgs);

  const campaignParticipationData = await getEligibleCampaignParticipations(maxSnapshotCount);

  await generateKnowledgeElementSnapshots(campaignParticipationData, concurrency);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error('\x1b[31mErreur : %s\x1b[0m', error.message);
      yargs.showHelp();
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { generateKnowledgeElementSnapshots, getEligibleCampaignParticipations };
