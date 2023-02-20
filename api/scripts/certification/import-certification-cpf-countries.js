// downloaded from https://www.data.gouv.fr/fr/datasets/code-officiel-geographique-cog/

'use strict';
import { parseCsv } from '../helpers/csvHelpers';
import { knex, disconnect } from '../../db/knex-database-connection';
import { normalizeAndSortChars } from '../../lib/infrastructure/utils/string-utils';
import _ from 'lodash';

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

function checkTransformUnicity(countries) {
  const grouped = _.groupBy(countries, 'matcher');
  let hasError = false;
  for (const code in grouped) {
    const group = grouped[code];
    const uniq = _.uniq(_.map(group, 'code'));
    if (uniq.length > 1) {
      const conflictNames = group.map((country) => country.originalName);
      console.error(`CONFLICT: ${uniq.join()} ${conflictNames.join()}`);
      hasError = true;
    }
  }

  if (hasError) throw new Error('There are more than 1 transformed name with distinct code');
}

const isLaunchedFromCommandLine = require.main === module;

async function main(filePath) {
  console.log('Starting script import-certification-cpf-countries');
  const trx = await knex.transaction();

  try {
    console.log('Reading and parsing csv data file... ');
    const csvData = await parseCsv(filePath, { header: true, delimiter: ',', skipEmptyLines: true });
    console.log('ok');

    console.log('Retrieving countries name and code... ');
    const countries = buildCountries({ csvData });
    console.log('ok');

    console.log('Verify data integrity... ');
    checkTransformUnicity(countries);

    console.log('Emptying existing countries in database... ');
    await trx('certification-cpf-countries').del();
    console.log('Inserting countries in database... ');
    await trx.batchInsert('certification-cpf-countries', countries);
    trx.commit();
    console.log('ok');

    console.log('\nDone.');
  } catch (error) {
    if (trx) {
      trx.rollback();
    }
  }
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

export default {
  buildCountries,
  checkTransformUnicity,
};
