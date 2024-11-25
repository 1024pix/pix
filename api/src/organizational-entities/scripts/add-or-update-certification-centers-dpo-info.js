import Joi from 'joi';

import { updateCertificationCenterDataProtectionOfficerInformation } from '../../../lib/domain/usecases/update-certification-center-data-protection-officer-information.js';
import { csvFileParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import * as dataProtectionOfficerRepository from '../infrastructure/repositories/data-protection-officer.repository.js';

const columnsSchemas = [
  { name: 'certificationCenterId', schema: Joi.number() },
  { name: 'firstName', schema: Joi.string().trim().optional() },
  { name: 'lastName', schema: Joi.string().trim().optional() },
  { name: 'email', schema: Joi.string().trim().replace(' ', '').lowercase().email().optional().default(null) },
];

export class AddOrUpdateCertificationCentersDpoInfoScript extends Script {
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

await ScriptRunner.execute(import.meta.url, AddOrUpdateCertificationCentersDpoInfoScript);
