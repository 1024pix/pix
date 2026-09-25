// Usage: node script/certification/import-certification-cpf-countries.js path/file.csv
// File Millésime 2021 : Liste des pays et territoires étrangers au 01/01/2021
// downloaded from https://www.data.gouv.fr/fr/datasets/code-officiel-geographique-cog/

import * as url from 'node:url';

import _ from 'lodash';

import { databaseConnectionRegistry } from '../../../db/database-connection-registry.js';
import { knex } from '../../../db/knex-database-connection.js';
import { parseCsv } from '../../../scripts/helpers/csvHelpers.js';
import { logger } from '../../shared/infrastructure/utils/logger.js';
import { normalizeAndSortChars } from '../../shared/infrastructure/utils/string-utils.js';
const CURRENT_NAME_COLUMN = 'LIBCOG';
const ALTERNATIVE_NAME_COLUMN = 'LIBENR';
const INSEE_CODE_COLUMN = 'COG';
const TYPE_COLUMN = 'ACTUAL';

// Dans le fichier, le code INSEE de la France est de ses territoires est XXXXX.
// Nous remplaçons cette valeur par le véritable code de la France: 99100
const FRENCH_CODE_IN_FILE = 'XXXXX';

const TYPES = {
  actuel: '1',
  perime: '2',
  territoire_sans_code_officiel_geographique: '3',
  territoire_ayant_code_officiel_geographique: '4',
};

function _filterOutDeprecatedAndNonCOG(data) {
  return (
    data[TYPE_COLUMN] === TYPES['actuel'] || data[TYPE_COLUMN] === TYPES['territoire_ayant_code_officiel_geographique']
  );
}

function buildCountries({ csvData }) {
  return csvData
    .filter((data) => _filterOutDeprecatedAndNonCOG(data))
    .flatMap((data) => {
      const result = [];
      let code = data[INSEE_CODE_COLUMN];
      if (code === FRENCH_CODE_IN_FILE) {
        code = '99100';
      }
      result.push({
        code,
        commonName: data[CURRENT_NAME_COLUMN],
        originalName: data[CURRENT_NAME_COLUMN],
        matcher: normalizeAndSortChars(data[CURRENT_NAME_COLUMN]),
      });
      if (data[ALTERNATIVE_NAME_COLUMN] && data[ALTERNATIVE_NAME_COLUMN] !== data[CURRENT_NAME_COLUMN]) {
        result.push({
          code,
          commonName: data[CURRENT_NAME_COLUMN],
          originalName: data[ALTERNATIVE_NAME_COLUMN],
          matcher: normalizeAndSortChars(data[ALTERNATIVE_NAME_COLUMN]),
        });
      }
      return result;
    });
}

function checkTransformUnicity(countries, logger) {
  const grouped = _.groupBy(countries, 'matcher');
  let hasError = false;
  for (const code in grouped) {
    const group = grouped[code];
    const uniq = _.uniq(_.map(group, 'code'));
    if (uniq.length > 1) {
      const conflictNames = group.map((country) => country.originalName);
      logger.error(`CONFLICT: ${uniq.join()} ${conflictNames.join()}`);
      hasError = true;
    }
  }

  if (hasError) throw new Error('There are more than 1 transformed name with distinct code');
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main(filePath, logger) {
  logger.info('Starting script import-certification-cpf-countries');
  const trx = await knex.transaction();

  try {
    logger.info(`Reading and parsing csv data file ${filePath}... `);
    const csvData = await parseCsv(filePath, { header: true, delimiter: ',', skipEmptyLines: true });
    logger.info('ok');

    logger.info('Retrieving countries name and code... ');
    const countries = buildCountries({ csvData });
    logger.info('ok');

    logger.info('Verify data integrity... ');
    checkTransformUnicity(countries, logger);

    logger.info('Emptying existing countries in database... ');
    await trx('certification-cpf-countries').del();
    logger.info('Inserting countries in database... ');
    await knex.batchInsert('certification-cpf-countries', countries).transacting(trx);
    await trx.commit();
    logger.info('ok');

    logger.info('\nDone.');
  } catch (error) {
    if (trx) {
      await trx.rollback();
    }
    throw error;
  }
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      const filePath = process.argv[2];
      await main(filePath, logger);
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await databaseConnectionRegistry.disconnect();
    }
  }
})();

export { buildCountries, checkTransformUnicity };
