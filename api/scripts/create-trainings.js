const { knex, disconnect } = require('../db/knex-database-connection');
const { parseCsvWithHeaderAndRequiredFields } = require('./helpers/csvHelpers');
const REQUIRED_FIELD_NAMES = ['title', 'link', 'type', 'duration', 'locale'];

function prepareDataForInsert(rawTrainings) {
  return rawTrainings.map(({ title, link, type, duration, locale }) => {
    const trimmedType = type.trim();
    if (['webinaire', 'autoformation'].includes(trimmedType)) {
      return {
        title: title.trim(),
        link: link.trim(),
        type: type.trim(),
        duration: duration.trim(),
        locale: locale.trim(),
      };
    }

    throw new Error(`The type of training : "${title}" is invalid.`);
  });
}

async function createTrainings(trainings) {
  return knex.batchInsert('trainings', trainings);
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting creating trainings.');

  const filePath = process.argv[2];

  console.log('Reading and parsing csv data file... ');
  const csvData = await parseCsvWithHeaderAndRequiredFields({ filePath, requiredFieldNames: REQUIRED_FIELD_NAMES });

  console.log('Preparing data... ');
  const trainings = prepareDataForInsert(csvData);
  console.log('ok');

  console.log('Inserting trainings in database...');
  await createTrainings(trainings);
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

module.exports = {
  createTrainings,
  prepareDataForInsert,
};
