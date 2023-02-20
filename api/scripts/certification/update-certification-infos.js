require('dotenv').config({ path: `${__dirname}/../.env` });

import bluebird from 'bluebird';
import { readFile } from 'fs/promises';
import logger from '../../lib/infrastructure/logger';
// Usage: node scripts/update-certifications-infos path/data.csv path/sessionsId.csv
// data.csv
// #externalId,birthdate,birthINSEECode,birthPostalCode,birthCity,birthCountry
// #EXTERNAL_ID,2000-01-01,NULL,75550, paris,FRANCE
// sessionsId.csv
// 1,12,30

('use strict');
import { parseCsv, checkCsvHeader } from '../helpers/csvHelpers';
import { knex, disconnect } from '../../db/knex-database-connection';
import values from 'lodash/values';

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
  const info = { success: 0, failure: 0 };

  try {
    await bluebird.mapSeries(
      csvData,
      async ({ birthdate, birthINSEECode, birthPostalCode, birthCity, birthCountry, externalId }) => {
        const certificationCourse = await trx
          .select('id', 'userId')
          .from('certification-courses')
          .where({ externalId: `${externalId}` })
          .whereInArray('sessionId', sessionIds)
          .first();

        if (!certificationCourse) {
          logger.warn(`Certification for external id ${externalId} not found`);
          info.failure++;
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

        info.success++;
      }
    );

    await trx.commit();
    logger.info('✅ ');
    logger.info(`Certifications mises à jour: ${info.success}/${csvData.length} (${info.failure})`);
  } catch (error) {
    if (trx) {
      await trx.rollback();
    }
    logger.error(error);
    throw error;
  }

  logger.info('Done.');
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const dataFilePath = process.argv[2];
  const sessionIdsFilePath = process.argv[3];
  await updateCertificationInfos(dataFilePath, sessionIdsFilePath);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export default {
  updateCertificationInfos,
  headers,
};
