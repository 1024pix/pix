const { checkCsvExtensionFile, parseCsvWithHeader } = require('./helpers/csvHelpers');

const Bookshelf = require('../lib/infrastructure/bookshelf');

function prepareDataForInsert(rawCertificationCenters) {
  return rawCertificationCenters.map(({ name, uai }) => {
    return {
      name: name.trim(),
      externalId: uai,
      type: 'SCO'
    };
  });
}

function createScoCertificationCenters(certificationCenters) {
  return Bookshelf.knex.batchInsert('certification-centers', certificationCenters);
}

async function main() {
  console.log('Starting creating or updating SCO organizations.');

  try {
    const filePath = process.argv[2];

    console.log('Check csv extension file... ');
    checkCsvExtensionFile(filePath);
    console.log('ok');

    console.log('Reading and parsing csv data file... ');
    const csvData = parseCsvWithHeader(filePath);
    console.log('ok');

    console.log('Preparing data and add SCO type... ');
    const certificationCenters = prepareDataForInsert(csvData);
    console.log('ok');

    console.log('Creating Certification Centers...');
    await createScoCertificationCenters(certificationCenters);
    console.log('\nDone.');

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

module.exports = {
  prepareDataForInsert,
  createScoCertificationCenters
};
