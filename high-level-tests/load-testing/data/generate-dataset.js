require('dotenv').config();
const importReferentialData = require('./import-referential-data');
const bulkDataGeneration = require('./bulk-data-generation');

(
  async () => {
    console.log('Importing referential...');
    await importReferentialData.run();
    console.log('Referential imported');

    console.log('Generating dataset...');
    await bulkDataGeneration.run();
    console.log('Dataset generated');
  }
)();
