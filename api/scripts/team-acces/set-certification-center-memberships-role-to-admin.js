import url from 'url';

import _ from 'lodash';
import bluebird from 'bluebird';

import { disconnect } from '../../db/knex-database-connection.js';
import { checkCsvHeader, parseCsvWithHeader } from '../helpers/csvHelpers.js';
import { usecases } from '../../lib/domain/usecases/index.js';

const MODULE_PATH = url.fileURLToPath(import.meta.url);
const IS_LAUNCHED_FROM_CLI = process.argv[1] === MODULE_PATH;
const TIMER_NAME = '';
const REQUIRED_FIELD_NAMES = ['certificationCenterId', 'userId'];

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

  const certificationCenterMembershipsData = await parseCsvWithHeader(filePath, parsingOptions);
  const errors = [];

  await bluebird.mapSeries(certificationCenterMembershipsData, async (certificationCenterMembershipData) => {
    const { certificationCenterId, userId } = certificationCenterMembershipData;

    try {
      await usecases.setCertificationCenterMembershipRoleToAdmin({ certificationCenterId, userId });
    } catch (error) {
      errors.push({ certificationCenterMembershipData, error });
    }
  });

  if (errors.length === 0) return;

  console.log(`Errors occurs on ${errors.length} element(s)!`);
  errors.forEach((error) => {
    console.log(JSON.stringify(error.certificationCenterMembershipData));
    console.error(error.error?.message);
  });

  throw new Error('Process done with errors');
}

(async function () {
  if (IS_LAUNCHED_FROM_CLI) {
    try {
      console.time(TIMER_NAME);
      await main();
      console.log('\nCertification center memberships updated with success!');
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    } finally {
      await disconnect();
      console.timeEnd(TIMER_NAME);
    }
  }
})();
