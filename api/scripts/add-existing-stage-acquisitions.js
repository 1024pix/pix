import dotenv from 'dotenv';

dotenv.config();
import perf_hooks from 'perf_hooks';
import * as url from 'url';

const { performance } = perf_hooks;

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { logger } from '../lib/infrastructure/logger.js';
import { learningContentCache as cache } from '../lib/infrastructure/caches/learning-content-cache.js';
import { knex, disconnect } from '../db/knex-database-connection.js';
import { batch } from '../db/batch-processing.js';
import { usecases } from '../lib/domain/usecases/index.js';
import { Assessment } from '../lib/domain/models/Assessment.js';

const MAX_RANGE_SIZE = 100_000;

const handleStageAcquisitions = async ({ idMin, idMax, throwError }) => {
  if (throwError) {
    throw new Error('An error occurred');
  }
  return knex('assessments')
    .select('*')
    .whereBetween('id', [idMin, idMax])
    .where({
      state: 'completed',
      type: 'CAMPAIGN',
    })
    .orderBy('id', 'asc')
    .then((allCompletedAssessments) => {
      return batch(knex, allCompletedAssessments, (completedAssessment) => {
        const assessment = new Assessment(completedAssessment);
        return usecases.handleStageAcquisition({ assessment });
      });
    });
};

function getAllArgs() {
  return yargs(hideBin(process.argv))
    .option('idMin', {
      type: 'number',
      demand: true,
      description: 'id du premier assessment',
    })
    .option('idMax', {
      type: 'number',
      demand: true,
      description: 'id du dernier assessment',
    })
    .option('maxRangeSize', {
      type: 'number',
      demand: true,
      description: `taille de la plage d'assessments à parcourir`,
    })
    .help().argv;
}

function normalizeRange({ idMin, idMax, maxRangeSize }) {
  const rangeSize = idMax - idMin;
  const range = maxRangeSize || MAX_RANGE_SIZE;
  if (rangeSize > range) {
    const newIdMax = idMin + range;
    logger.info(`Max range size exceeded : new idMax is ${newIdMax}`);
    return { idMin, idMax: newIdMax };
  }
  return { idMin, idMax };
}

async function main() {
  const startTime = performance.now();

  logger.info('\n---\n* Starting existing stage-acquisitions insertions.\n---\n');
  const { idMin, idMax, maxRangeSize } = getAllArgs();
  const range = normalizeRange({ idMin, idMax, maxRangeSize });

  await handleStageAcquisitions({ ...range, throwError: false });
  logger.info('\n---\n* Done.\n---\n');

  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`\n---\n* Script has ended: took ${duration} milliseconds\n---\n`);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
      process.exitCode = 0;
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
      await cache.quit();
      // eslint-disable-next-line n/no-process-exit
      process.exit();
    }
  }
})();

export { handleStageAcquisitions };
