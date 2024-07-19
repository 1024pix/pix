import 'dotenv/config';

import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { CertificationRescoringByScriptJob } from '../../lib/infrastructure/jobs/certification/CertificationRescoringByScriptJob.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main(certificationCourseIds) {
  logger.info(`Publishing ${certificationCourseIds.length} rescoring jobs`);
  const jobs = await _scheduleRescoringJobs(certificationCourseIds);

  const errors = jobs.filter((result) => result.status === 'rejected');
  if (errors.length) {
    errors.forEach((result) => logger.error(result.reason, 'Some jobs could not be published'));
    return 1;
  }

  logger.info(`${jobs.length} jobs successfully published`);
  return 0;
}

const _scheduleRescoringJobs = async (certificationCourseIds) => {
  const publisher = new CertificationRescoringByScriptJob(knex);
  const promisefiedJobs = certificationCourseIds.map(async (certificationCourseId) => {
    try {
      await publisher.schedule(certificationCourseId);
    } catch (error) {
      throw new Error(`Error for certificationCourseId: [${certificationCourseId}]`, { cause: error });
    }
  });
  return Promise.allSettled(promisefiedJobs);
};

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      const certificationCourseIds = process.argv[2]
        .split(',')
        .map((str) => parseInt(str, 10))
        .filter(Number.isInteger);
      const exitCode = await main(certificationCourseIds);
      return exitCode;
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { main };
