require('dotenv').config({ path: `${__dirname}/../.env` });

const logger = require('../lib/infrastructure/logger');
// Usage: node scripts/update-certifications-infos path/file.csv

('use strict');
const { parseCsv, checkCsvHeader } = require('./helpers/csvHelpers');
const { knex } = require('../db/knex-database-connection');
const values = require('lodash/values');

const headers = {
  externalId: 'externalId',
  birthdate: 'birthdate',
  birthINSEECode: 'birthINSEECode',
  birthPostalCode: 'birthPostalCode',
  birthCity: 'birthCity',
  birthCountry: 'birthCountry',
};

async function main(filePath) {
  logger.info('Starting script update-certifications-infos');

  logger.trace(`Checking ${filePath} data file...`);
  await checkCsvHeader({ filePath, requiredFieldNames: values(headers) });
  logger.info('✅');

  logger.info('Reading and parsing csv data file... ');
  const csvData = await parseCsv(filePath, { header: true, delimiter: ',', skipEmptyLines: true });
  logger.info('✅');

  logger.info('Updating data in database... ');

  const trx = await knex.transaction();

  try {
    for (const row of csvData) {
      const { birthdate, birthINSEECode, birthPostalCode, birthCity, birthCountry, externalId } = row;
      const { id, userId } = await trx
        .select('id', 'userId')
        .from('certification-courses')
        .where({ externalId })
        .first();

      await trx
        .table('certification-courses')
        .update({
          birthdate,
          birthplace: birthCity,
          birthPostalCode,
          birthINSEECode,
          birthCountry,
        })
        .where({ id });

      await trx
        .table('certification-candidates')
        .update({
          birthdate,
          birthINSEECode,
          birthPostalCode,
          birthCity,
          birthCountry,
        })
        .where({ externalId, userId });
    }

    trx.commit();
    logger.info('✅');
  } catch (error) {
    if (trx) {
      trx.rollback();
    }
    logger.error(error);
    process.exit(1);
  }

  logger.info('Done.');
}

if (require.main === module) {
  const filePath = process.argv[2];
  main(filePath).then(
    () => process.exit(0),
    (err) => {
      logger.error(err);
      process.exit(1);
    }
  );
}
