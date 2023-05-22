import { parseCsvWithHeader } from './helpers/csvHelpers.js';
import { Bookshelf } from '../lib/infrastructure/bookshelf.js';
import { disconnect } from '../db/knex-database-connection.js';

function prepareDataForInsert(rawCertificationCenters) {
  return rawCertificationCenters.map(({ name, uai }) => {
    return {
      name: name.trim(),
      externalId: uai,
      type: 'SCO',
    };
  });
}

function createScoCertificationCenters(certificationCenters) {
  return Bookshelf.knex.batchInsert('certification-centers', certificationCenters);
}

import * as url from 'url';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  console.log('Starting creating SCO certification centers.');

  const filePath = process.argv[2];

  console.log('Reading and parsing csv data file... ');
  const csvData = await parseCsvWithHeader(filePath);
  console.log('ok');

  console.log('Preparing data and add SCO type... ');
  const certificationCenters = prepareDataForInsert(csvData);
  console.log('ok');

  console.log('Creating Certification Centers...');
  await createScoCertificationCenters(certificationCenters);
  console.log('\nDone.');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { prepareDataForInsert, createScoCertificationCenters };
