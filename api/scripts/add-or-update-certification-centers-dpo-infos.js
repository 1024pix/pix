import Joi from 'joi';

import { updateCertificationCenterDataProtectionOfficerInformation } from '../lib/domain/usecases/update-certification-center-data-protection-officer-information.js';
import * as dataProtectionOfficerRepository from '../lib/infrastructure/repositories/data-protection-officer-repository.js';
import { BaseScript } from '../src/shared/application/scripts/base-script.js';
import { csvFileParser } from '../src/shared/application/scripts/parsers.js';
import { ScriptRunner } from '../src/shared/application/scripts/script-runner.js';

const columnsSchemas = [
  { name: 'certificationCenterId', schema: Joi.number() },
  { name: 'firstName', schema: Joi.string().trim().optional() },
  { name: 'lastName', schema: Joi.string().trim().optional() },
  { name: 'email', schema: Joi.string().trim().replace(' ', '').lowercase().email().optional().default(null) },
];

export class AddOrUpdateCertificationCentersDpoInfosScript extends BaseScript {
  constructor() {
    super({
      description: 'This is script is adding or updating certification centers data protection officer information.',
      permanent: true,
      options: {
        file: {
          type: 'string',
          describe: 'CSV File to process',
          demandOption: true,
          coerce: csvFileParser(columnsSchemas),
        },
      },
    });
  }

  async handle({ options, logger }) {
    const { file: dataProtectionOfficers } = options;

    const errors = [];
    for (const dataProtectionOfficer of dataProtectionOfficers) {
      try {
        await updateCertificationCenterDataProtectionOfficerInformation({
          dataProtectionOfficer,
          dataProtectionOfficerRepository,
        });
      } catch (error) {
        errors.push({ dataProtectionOfficer, error });
      }
    }

    if (errors.length === 0) return;

    logger.info(`Errors occurs on ${errors.length} element!`);
    errors.forEach((error) => {
      logger.info(JSON.stringify(error.dataProtectionOfficer));
      logger.error(error.error?.message);
    });

    throw new Error('Process done with errors');
  }
}

await ScriptRunner.execute(import.meta.url, AddOrUpdateCertificationCentersDpoInfosScript);
