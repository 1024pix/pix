#!/usr/bin/env node
// eslint-disable-file node/no-process-exit

const dotenv = require('dotenv');
dotenv.config();
const logger = require('../../lib/infrastructure/logger');

/**
 * Usage: node scripts/import-certification-cpf-cities path/file.csv
 * File is semi-colon separated values, headers being:
 * code_commune_insee;nom_de_la_commune;code_postal;ligne_5
 * ligne_5 is used for potential alternative city name
 *
 * File downloaded from https://www.data.gouv.fr/fr/datasets/base-officielle-des-codes-postaux/ (Export au format CSV)
 **/

('use strict');
const { parseCsv, checkCsvHeader } = require('../helpers/csvHelpers');
const { knex, disconnect } = require('../../db/knex-database-connection');
const uniqBy = require('lodash/uniqBy');
const values = require('lodash/values');

const wordsToReplace = [
  {
    regex: /(^|\s)STE($|\s)/,
    value: 'SAINTE',
  },
  {
    regex: /(^|\s)ST($|\s)/,
    value: 'SAINT',
  },
];

const districtCities = [
  {
    name: 'PARIS',
    postalCode: 75000,
    INSEECode: 75056,
    isActualName: true,
  },
  {
    name: 'PARIS',
    postalCode: 75001,
    INSEECode: 75101,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75002,
    INSEECode: 75102,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75003,
    INSEECode: 75103,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75004,
    INSEECode: 75104,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75005,
    INSEECode: 75106,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75006,
    INSEECode: 75106,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75007,
    INSEECode: 75107,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75008,
    INSEECode: 75108,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75009,
    INSEECode: 75109,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75010,
    INSEECode: 75110,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 750011,
    INSEECode: 75111,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75012,
    INSEECode: 75112,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75013,
    INSEECode: 75113,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75014,
    INSEECode: 75114,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75015,
    INSEECode: 75115,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75016,
    INSEECode: 75116,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75017,
    INSEECode: 75117,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75018,
    INSEECode: 75118,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75019,
    INSEECode: 75119,
    isActualName: false,
  },
  {
    name: 'PARIS',
    postalCode: 75020,
    INSEECode: 75120,
    isActualName: false,
  },
  {
    name: 'LYON',
    postalCode: 69000,
    INSEECode: 69123,
    isActualName: true,
  },
  {
    name: 'LYON',
    postalCode: 69001,
    INSEECode: 69381,
    isActualName: false,
  },
  {
    name: 'LYON',
    postalCode: 69002,
    INSEECode: 69382,
    isActualName: false,
  },
  {
    name: 'LYON',
    postalCode: 69003,
    INSEECode: 69383,
    isActualName: false,
  },
  {
    name: 'LYON',
    postalCode: 69004,
    INSEECode: 69384,
    isActualName: false,
  },
  {
    name: 'LYON',
    postalCode: 69005,
    INSEECode: 69385,
    isActualName: false,
  },
  {
    name: 'LYON',
    postalCode: 69006,
    INSEECode: 69386,
    isActualName: false,
  },
  {
    name: 'LYON',
    postalCode: 69007,
    INSEECode: 69387,
    isActualName: false,
  },
  {
    name: 'LYON',
    postalCode: 69008,
    INSEECode: 69388,
    isActualName: false,
  },
  {
    name: 'LYON',
    postalCode: 69009,
    INSEECode: 69389,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13000,
    INSEECode: 13055,
    isActualName: true,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13001,
    INSEECode: 13201,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13002,
    INSEECode: 13202,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13003,
    INSEECode: 13203,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13004,
    INSEECode: 13204,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13005,
    INSEECode: 13205,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13006,
    INSEECode: 13206,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13007,
    INSEECode: 13207,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13008,
    INSEECode: 13208,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13009,
    INSEECode: 13209,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13010,
    INSEECode: 13210,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13011,
    INSEECode: 13211,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13012,
    INSEECode: 13212,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13013,
    INSEECode: 13213,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13014,
    INSEECode: 13214,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13015,
    INSEECode: 13215,
    isActualName: false,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13016,
    INSEECode: 13216,
    isActualName: false,
  },
];

const headers = {
  cityName: 'nom_de_la_commune',
  postalCode: 'code_postal',
  inseeCode: 'code_commune_insee',
  cityAlternateName: 'ligne_5',
};

function getCitiesWithDistricts() {
  return districtCities;
}

function buildCities({ csvData }) {
  const citiesWithAlternates = csvData.flatMap((data) => {
    const result = [];

    const codes = {
      postalCode: data[headers.postalCode],
      INSEECode: data[headers.inseeCode],
    };

    // Generate cities for current city names
    result.push({
      name: data[headers.cityName],
      isActualName: true,
      ...codes,
    });

    if (_doesCityNameContainWordToReplace(data[headers.cityName])) {
      result.push({
        name: _buildCityNameWithWordReplaced(data[headers.cityName]),
        isActualName: false,
        ...codes,
      });
    }

    // Generate cities for current alternate city names
    if (data[headers.cityAlternateName]) {
      result.push({
        name: data[headers.cityAlternateName],
        isActualName: false,
        ...codes,
      });

      if (_doesCityNameContainWordToReplace(data[headers.cityAlternateName])) {
        result.push({
          name: _buildCityNameWithWordReplaced(data[headers.cityAlternateName]),
          isActualName: false,
          ...codes,
        });
      }
    }

    return result;
  });

  return uniqBy(citiesWithAlternates, (city) => `${city.INSEECode}${city.postalCode}${city.name}`);
}

function _getInsertedLineNumber(batchInfo) {
  return batchInfo.map(({ rowCount }) => rowCount).reduce((acc, count) => acc + count, 0);
}

function _doesCityNameContainWordToReplace(cityName) {
  return wordsToReplace.some(({ regex }) => regex.test(cityName));
}

function _buildCityNameWithWordReplaced(cityName) {
  const entry = wordsToReplace.find(({ regex }) => regex.test(cityName));
  return cityName.replace(entry.regex, ` ${entry.value} `).trim();
}

const isLaunchedFromCommandLine = require.main === module;

async function main(filePath) {
  logger.info('Starting script import-certification-cpf-cities');

  let trx;
  try {
    logger.info(`Checking ${filePath} data file...`);
    await checkCsvHeader({ filePath, requiredFieldNames: values(headers) });
    logger.info('✅ ');

    logger.info('Reading and parsing csv data file... ');
    const csvData = await parseCsv(filePath, { header: true, delimiter: ';', skipEmptyLines: true });
    logger.info('✅ ');

    logger.info('Retrieving postal code, INSEE code and city name... ');
    const cities = buildCities({ csvData }).concat(getCitiesWithDistricts());
    logger.info('✅ ');

    logger.info('Inserting cities in database... ');
    trx = await knex.transaction();
    await trx('certification-cpf-cities').del();
    const batchInfo = await trx.batchInsert('certification-cpf-cities', cities);
    const insertedLines = _getInsertedLineNumber(batchInfo);
    logger.info('✅ ');
    trx.commit();
    logger.info(`Added lines: ${insertedLines} (${districtCities.length} exception cases)`);
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

module.exports = {
  buildCities,
  getCitiesWithDistricts,
};
