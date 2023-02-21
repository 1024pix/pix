import dotenv from 'dotenv';
dotenv.config();

import _ from 'lodash';
import bluebird from 'bluebird';
import { checkCsvHeader, parseCsvWithHeader } from './helpers/csvHelpers';
import { disconnect } from '../db/knex-database-connection';
import updateOrganizationDataProtectionOfficerInformation from '../lib/domain/usecases/update-organization-data-protection-officer-information';
import dataProtectionOfficerRepository from '../lib/infrastructure/repositories/data-protection-officer-repository';

const IS_LAUNCHED_FROM_CLI = require.main === module;
const REQUIRED_FIELD_NAMES = ['organizationId', 'firstName', 'lastName', 'email'];

const parsingOptions = {
  skipEmptyLines: true,
  header: true,
  transform: (value, columnName) => {
    if (typeof value === 'string') {
      value = value.trim();
    }
    if (!_.isEmpty(value)) {
      if (columnName === 'organizationId') {
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

async function _updateOrganizationsDataProtectionOfficerInformation(filePath) {
  const errors = [];

  await checkCsvHeader({
    filePath,
    requiredFieldNames: REQUIRED_FIELD_NAMES,
  });

  console.log('Reading and parsing csv data file... ');

  const dataProtectionOfficers = await parseCsvWithHeader(filePath, parsingOptions);

  await bluebird.mapSeries(dataProtectionOfficers, async (dataProtectionOfficer) => {
    try {
      await updateOrganizationDataProtectionOfficerInformation({
        dataProtectionOfficer,
        dataProtectionOfficerRepository,
      });
    } catch (error) {
      errors.push({ dataProtectionOfficer, error });
    }
  });

  if (errors.length === 0) {
    return;
  }

  console.log(`Errors occurs on ${errors.length} element!`);
  errors.forEach((error) => {
    console.log(JSON.stringify(error.dataProtectionOfficer));
    console.error(error.error?.message);
  });

  throw new Error('Process done with errors');
}

async function main() {
  console.log('Starting updating organizations data protection officer information.');
  console.time('Organizations DPO updated');

  const filePath = process.argv[2];
  await _updateOrganizationsDataProtectionOfficerInformation(filePath);

  console.timeEnd('Organizations DPO updated');
}

(async function () {
  if (IS_LAUNCHED_FROM_CLI) {
    try {
      await main();
      console.log('\nOrganizations DPO information updated with success!');
    } catch (error) {
      console.error(error?.message);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();
