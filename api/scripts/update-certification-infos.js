require('dotenv').config({ path: `${__dirname}/../.env` });

const bluebird = require('bluebird');
const { readFile } = require('fs/promises');
const logger = require('../lib/infrastructure/logger');
// Usage: node scripts/update-certifications-infos path/data.csv path/sessionsId.csv
// data.csv
// #externalId,birthdate,birthINSEECode,birthPostalCode,birthCity,birthCountry
// #EXTERNAL_ID,2000-01-01,NULL,75550, paris,FRANCE
// sessionsId.csv
// 1,12,30

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

async function _getSessionIds(sessionIdsFilePath) {
  const csvData = await readFile(sessionIdsFilePath, 'utf8');
  return csvData.split(',').map((id) => parseInt(id, 10));
}

async function updateCertificationInfos(dataFilePath, sessionIdsFilePath) {
  logger.info('Starting script update-certifications-infos');

  logger.trace(`Checking ${dataFilePath} data file...`);
  await checkCsvHeader({ filePath: dataFilePath, requiredFieldNames: values(headers) });
  logger.info('✅ ');

  logger.info('Reading and parsing csv data file... ');
  const csvData = await parseCsv(dataFilePath, { header: true, delimiter: ',', skipEmptyLines: true });
  logger.info('✅ ');
  logger.info('Reading and csv session ids file... ');
  const sessionIds = await _getSessionIds(sessionIdsFilePath);
  logger.info('✅ ');

  logger.info('Updating data in database... ');

  const trx = await knex.transaction();

  try {
    await bluebird.mapSeries(
      csvData,
      async ({ birthdate, birthINSEECode, birthPostalCode, birthCity, birthCountry, externalId }) => {
        const certificationCourse = await trx
          .select('id', 'userId')
          .from('certification-courses')
          .where({ externalId })
          .whereInArray('sessionId', sessionIds)
          .first();

        if (!certificationCourse) {
          logger.warn(`Certification for external id ${externalId} not found`);
          return;
        }

        const { userId, id } = certificationCourse;

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
    );

    trx.commit();
    logger.info('✅ ');
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
  const dataFilePath = process.argv[2];
  const sessionIdsFilePath = process.argv[2];
  updateCertificationInfos(dataFilePath, sessionIdsFilePath).then(
    () => process.exit(0),
    (err) => {
      logger.error(err);
      process.exit(1);
    }
  );
}

module.exports = {
  updateCertificationInfos,
  headers,
};
