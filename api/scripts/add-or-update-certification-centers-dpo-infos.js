import _ from 'lodash';

import { updateCertificationCenterDataProtectionOfficerInformation } from '../lib/domain/usecases/update-certification-center-data-protection-officer-information.js';
import * as dataProtectionOfficerRepository from '../lib/infrastructure/repositories/data-protection-officer-repository.js';
import { BaseScript } from '../src/shared/application/scripts/base-script.js';
import { ScriptRunner } from '../src/shared/application/scripts/script-runner.js';
import { checkCsvHeader, parseCsvWithHeader } from './helpers/csvHelpers.js';

const REQUIRED_FIELD_NAMES = ['certificationCenterId', 'firstName', 'lastName', 'email'];

export class AddOrUpdateCertificationCentersDpoInfosScript extends BaseScript {
  constructor() {
    super({
      description: 'This is script is adding or updating certification centers data protection officer information.',
      permanent: true,
      options: {
        filePath: { type: 'string', describe: 'CSV File to process', demandOption: true },
      },
    });
  }

  async handle({ options, logger }) {
    const { filePath } = options;

    await checkCsvHeader({ filePath, requiredFieldNames: REQUIRED_FIELD_NAMES });

    logger.info('Reading and parsing csv data file... ');
    const dataProtectionOfficers = await parseCsvWithHeader(filePath, parsingOptions);

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

const parsingOptions = {
  skipEmptyLines: true,
  header: true,
  transform: (value, columnName) => {
    if (typeof value === 'string') {
      value = value.trim();
    }
    if (!_.isEmpty(value)) {
      if (columnName === 'certificationCenterId') {
        value = Number(value);
      }
      if (columnName === 'email') {
        value = value.replaceAll(' ', '').toLowerCase();
      }
    } else {
      value = null;
    }
    return value;
  },
};

await ScriptRunner.execute(import.meta.url, AddOrUpdateCertificationCentersDpoInfosScript);
