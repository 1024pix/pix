import 'dotenv/config';

import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { CertificationRescoringByScriptJob } from '../../lib/infrastructure/jobs/certification/CertificationRescoringByScriptJob.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main(certificationCourseIds) {
  const jobs = await _scheduleRescoringJobs(certificationCourseIds);

  const errors = jobs.filter((result) => result.status === 'rejected');

  if (errors.length) {
    errors.forEach((result) => logger.error('Some jobs could not be published', result.reason));

    // On informe la IIFE que on est pas bon
    return 1;
  }

  // On informe la IIFE qu'on est bon
  return 0;
}

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

async function _scheduleRescoringJobs(certificationCourseIds) {
  const publisher = new CertificationRescoringByScriptJob(knex);
  const promisefiedJobs = certificationCourseIds.map((certificationCourseId) =>
    publisher.schedule(certificationCourseId),
  );
  return Promise.allSettled(promisefiedJobs);
}

export { main };
