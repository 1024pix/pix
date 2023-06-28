import bluebird from 'bluebird';
import { disconnect } from '../db/knex-database-connection.js';
import { parseCsvWithHeader } from '../scripts/helpers/csvHelpers.js';
import { BookshelfOrganization } from '../lib/shared/infrastructure/orm-models/Organization.js';
import * as url from 'url';

async function updateOrganizationEmailByExternalId(externalId, email) {
  return BookshelfOrganization.where({ externalId })
    .save({ email }, { patch: true })
    .catch((err) => {
      if (err instanceof BookshelfOrganization.NoRowsUpdatedError) {
        console.error(`Organization not found for External ID ${externalId}`);
        return;
      }
      throw err;
    });
}

async function populateOrganizations(objectsFromFile) {
  return bluebird.mapSeries(objectsFromFile, ({ uai, email }) => {
    return updateOrganizationEmailByExternalId(uai, email);
  });
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  console.log("Start populating organization's email");
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: populate-organizations-email.js <FILE_NAME>.csv');
    throw new Error('Invalid usage');
  }

  console.log('Reading and parsing csv file (checking headers)... ');
  const csvData = await parseCsvWithHeader(filePath);
  console.log(`Successfully read ${csvData.length} records.`);

  console.log('Populating organizations (existing emails will be updated)... ');
  await populateOrganizations(csvData);
  console.log('\nOrganization successfully populated.');
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

export { populateOrganizations };
