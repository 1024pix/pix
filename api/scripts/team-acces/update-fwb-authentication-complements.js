import url from 'url';

import _ from 'lodash';
import bluebird from 'bluebird';

import { disconnect } from '../../db/knex-database-connection.js';
import { checkCsvHeader, parseCsvWithHeader } from '../helpers/csvHelpers.js';
import { usecases } from '../../lib/domain/usecases/index.js';
import { FWB } from '../../lib/domain/constants/oidc-identity-providers.js';

const MODULE_PATH = url.fileURLToPath(import.meta.url);
const IS_LAUNCHED_FROM_CLI = process.argv[1] === MODULE_PATH;
const TIMER_NAME = '';
const REQUIRED_FIELD_NAMES = ['SUB', 'FirstName', 'LastName', 'EmployeeNumber', 'Population'];

async function main() {
  const filePath = process.argv[2];
  const parsingOptions = {
    skipEmptyLines: true,
    header: true,
    transform: (value) => {
      if (typeof value === 'string') {
        value = value.trim();
      }
      if (_.isEmpty(value)) {
        value = null;
      }

      return value;
    },
  };

  await checkCsvHeader({
    filePath,
    requiredFieldNames: REQUIRED_FIELD_NAMES,
  });

  console.log('Reading and parsing csv data file... ');

  const fwbAuthenticationComplementsData = await parseCsvWithHeader(filePath, parsingOptions);
  const errors = [];

  await bluebird.mapSeries(fwbAuthenticationComplementsData, async (fwbAuthenticationComplementData) => {
    const {
      SUB: externalIdentifier,
      FirstName: given_name,
      LastName: family_name,
      Population: population,
      EmployeeNumber: employeeNumber,
    } = fwbAuthenticationComplementData;
    const authenticationComplement = { given_name, family_name, employeeNumber, population };

    try {
      await usecases.updateAuthenticationComplement({
        externalIdentifier,
        identityProvider: FWB.code,
        authenticationComplement,
      });
    } catch (error) {
      errors.push({ fwbAuthenticationComplementData, error });
    }
  });

  if (errors.length === 0) return;

  console.log(`Errors occurs on ${errors.length} element(s)!`);
  errors.forEach((error) => {
    console.log(JSON.stringify(error.fwbAuthenticationComplementData));
    console.error(error.error?.message);
  });

  throw new Error('Process done with errors');
}

(async function () {
  if (IS_LAUNCHED_FROM_CLI) {
    try {
      console.time(TIMER_NAME);
      await main();
      console.log('\n fwb authentication complements updated with success');
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    } finally {
      await disconnect();
      console.timeEnd(TIMER_NAME);
    }
  }
})();
