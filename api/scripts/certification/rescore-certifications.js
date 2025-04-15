import 'dotenv/config';

import Joi from 'joi';

import CertificationRescoredByScript from '../../src/certification/session-management/domain/events/CertificationRescoredByScript.js';
import { csvFileParser } from '../../src/shared/application/scripts/parsers.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';
import { handlersAsServices } from '../../src/shared/domain/events/index.js';

const columnsSchemas = [{ name: 'certificationCourseId', schema: Joi.number() }];

export class RescoreCertificationScript extends Script {
  constructor(services = handlersAsServices) {
    super({
      description: 'Rescore all certification given by CSV file. This script will schedule job to rescore',
      permanent: true,
      options: {
        file: {
          type: 'string',
          describe:
            'CSV File with only one column with certification-courses.id (integer) to process. Need `certificationCourseId`',
          demandOption: true,
          coerce: csvFileParser(columnsSchemas),
        },
      },
    });
    this.services = services;
  }

  async handle({ options, logger }) {
    const { file: certificationCourses } = options;

    for (const { certificationCourseId } of certificationCourses) {
      logger.info(`Rescoring certification-courses>id ${certificationCourseId.length}`);
      await this.services.handleCertificationRescoring({
        event: new CertificationRescoredByScript({ certificationCourseId }),
      });
    }

    return 0;
  }
}

await ScriptRunner.execute(import.meta.url, RescoreCertificationScript);
