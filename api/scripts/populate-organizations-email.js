const bluebird = require('bluebird');

const { NotFoundError } = require('../lib/domain/errors');

const { parseCsvWithHeader } = require('../scripts/helpers/csvHelpers');

const BookshelfOrganization = require('../lib/infrastructure/data/organization');

async function updateOrganizationEmailByExternalId(externalId, email) {
  return BookshelfOrganization
    .where({ externalId })
    .save({ email }, { patch: true })
    .catch((err) => {
      if (err instanceof BookshelfOrganization.NotFoundError) {
        throw new NotFoundError(`Organization not found for External ID ${externalId}`);
      }
      throw err;
    });
}

async function populateOrganizations(objectsFromFile) {
  return bluebird.mapSeries(objectsFromFile, ({ uai, email }) => {
    return updateOrganizationEmailByExternalId(uai, email);
  });
}

async function main() {
  console.log('Start populating organization\'s email');

  try {
    const filePath = process.argv[2];

    if (!filePath) {
      console.log('Usage: populate-organizations-email.js <FILE_NAME>.csv');
      process.exit(1);
    }

    console.log('Reading and parsing csv file (checking headers)... ');
    const csvData = parseCsvWithHeader(filePath);
    console.log(`Successfully read ${csvData.length} records.`);

    console.log('Populating organizations (existing emails will be updated)... ');
    await populateOrganizations(csvData);
    console.log('\nOrganization successfully populated.');

  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

module.exports = populateOrganizations;
