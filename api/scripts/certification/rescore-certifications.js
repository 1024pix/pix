import 'dotenv/config';

import * as url from 'node:url';

import { disconnect } from '../../db/knex-database-connection.js';
import { CertificationRescoringByScriptJob } from '../../src/certification/session-management/domain/models/CertificationRescoringByScriptJob.js';
import { certificationRescoringByScriptJobRepository } from '../../src/certification/session-management/infrastructure/repositories/jobs/certification-rescoring-by-script-job-repository.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import { executeAndLogScript } from '../tooling/tooling.js';

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
  const promisefiedJobs = certificationCourseIds.map(async (certificationCourseId) => {
    try {
      await certificationRescoringByScriptJobRepository.performAsync(
        new CertificationRescoringByScriptJob({ certificationCourseId }),
      );
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
      const mainWithArgs = main.bind(this, certificationCourseIds);
      return executeAndLogScript({ processArgvs: process.argv, scriptFn: mainWithArgs });
    } catch (error) {
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { main };
