import 'dotenv/config';

import lodash from 'lodash';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';
/**
 * Usage: node scripts/certification/import-pilot-certification-centers-from-csv.js path/file.csv
 * File is semicolon separated values, headers being:
 * certification_center_id
 **/
import { checkCsvHeader, parseCsv } from '../helpers/csvHelpers.js';
const { values } = lodash;
import * as url from 'node:url';

import { CERTIFICATION_FEATURES } from '../../src/certification/shared/domain/constants.js';

const headers = {
  certificationCenterId: 'certification_center_id',
};

function buildCertificationCentersPilotsList({ featureId, csvData }) {
  const dataRows = csvData;
  return dataRows.reduce((certificationCentersPilots, dataRow) => {
    const certification = {
      certificationCenterId: parseInt(dataRow[headers.certificationCenterId]),
      featureId,
    };
    certificationCentersPilots.push(certification);
    return certificationCentersPilots;
  }, []);
}

function _getInsertedLineNumber(batchInfo) {
  return batchInfo.map(({ rowCount }) => rowCount).reduce((acc, count) => acc + count, 0);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main(filePath) {
  logger.info('Starting script import-pilot-certification-centers-from-csv');

  let trx;
  try {
    logger.info(`Checking ${filePath} data file...`);
    await checkCsvHeader({ filePath, requiredFieldNames: values(headers) });
    logger.info('✅ ');

    logger.info('Reading and parsing csv data file... ');
    const csvData = await parseCsv(filePath, { header: true, delimiter: ';', skipEmptyLines: true });
    logger.info('✅ ');

    const featureId = await knex
      .select('id')
      .from('features')
      .where({ key: CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key })
      .first()
      .then((row) => row.id);

    logger.info('Retrieving certification center pilots... ');
    const certificationCentersPilotsList = buildCertificationCentersPilotsList({ featureId, csvData });
    logger.info('✅ ');
    logger.info('Inserting pilot certification center ids in database... ');
    trx = await knex.transaction();
    await trx('certification-center-features').del();
    const batchInfo = await trx.batchInsert('certification-center-features', certificationCentersPilotsList);
    const insertedLines = _getInsertedLineNumber(batchInfo);
    logger.info('✅ ');
    trx.commit();
    logger.info(`Added lines: ${insertedLines}`);
    logger.info('Done.');
  } catch (error) {
    if (trx) {
      trx.rollback();
    }
    throw error;
  }
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      const filePath = process.argv[2];
      await main(filePath);
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { buildCertificationCentersPilotsList, main };
