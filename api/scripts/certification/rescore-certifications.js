import 'dotenv/config';

import Joi from 'joi';

import { CertificationRescoringByScriptJob } from '../../src/certification/session-management/domain/models/CertificationRescoringByScriptJob.js';
import { certificationRescoringByScriptJobRepository } from '../../src/certification/session-management/infrastructure/repositories/jobs/certification-rescoring-by-script-job-repository.js';
import { CsvFileMixin } from '../../src/shared/application/scripts/addons/csvFile.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';

// CSV File with only one column with certification-courses.id (integer) to process. Need `certificationCourseId`'
const columnsSchemas = [{ name: 'certificationCourseId', schema: Joi.number() }];

export class RescoreCertificationScript extends Script.withAddons(CsvFileMixin(columnsSchemas)) {
  constructor() {
    super({
      description: 'Rescore all certification given by CSV file. This script will schedule job to rescore',
      permanent: true,
    });
  }

  async handle({ options, logger }) {
    const { file: certificationCourses } = options;
    const certificationCourseIds = certificationCourses.map(({ certificationCourseId }) => certificationCourseId);

    logger.info(`Publishing ${certificationCourseIds.length} rescoring jobs`);
    const jobs = await this.#scheduleRescoringJobs(certificationCourseIds);

    const errors = jobs.filter((result) => result.status === 'rejected');
    if (errors.length) {
      errors.forEach((result) => logger.error(result.reason, 'Some jobs could not be published'));
      return 1;
    }

    logger.info(`${jobs.length} jobs successfully published`);
    return 0;
  }

  async #scheduleRescoringJobs(certificationCourseIds) {
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
  }
}

await ScriptRunner.execute(import.meta.url, RescoreCertificationScript);
