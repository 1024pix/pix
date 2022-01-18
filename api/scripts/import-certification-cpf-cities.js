#!/usr/bin/env node

// Usage: node import-certification-cpf-cities path/file.csv
// File downloaded from https://www.data.gouv.fr/fr/datasets/base-officielle-des-codes-postaux/

'use strict';
const { parseCsv } = require('./helpers/csvHelpers');
const { knex } = require('../lib/infrastructure/bookshelf');
const uniqBy = require('lodash/uniqBy');

const CITY_COLUMN_NAME = 'nom_de_la_commune';
const POSTAL_CODE_COLUMN_NAME = 'code_postal';
const INSEE_CODE_COLUMN_NAME = 'code_commune_insee';
const ALTERNATE_CITY_COLUMN_NAME = 'ligne_5';

function buildCities({ csvData }) {
  const citiesWithAlternates = csvData.flatMap((data) => {
    const result = [];
    result.push({
      name: data[CITY_COLUMN_NAME],
      postalCode: data[POSTAL_CODE_COLUMN_NAME],
      INSEECode: data[INSEE_CODE_COLUMN_NAME],
      isActualName: true,
    });

    if (data[ALTERNATE_CITY_COLUMN_NAME]) {
      result.push({
        name: data[ALTERNATE_CITY_COLUMN_NAME],
        postalCode: data[POSTAL_CODE_COLUMN_NAME],
        INSEECode: data[INSEE_CODE_COLUMN_NAME],
        isActualName: false,
      });
    }
    return result;
  });

  return uniqBy(citiesWithAlternates, (city) => `${city.INSEECode}${city.postalCode}${city.name}`);
}

async function main(filePath) {
  console.log('Starting script import-certification-cpf-cities');

  let trx;
  try {
    console.log('Reading and parsing csv data file... ');
    const csvData = await parseCsv(filePath, { header: true, delimiter: ';', skipEmptyLines: true });
    console.log('✅');

    console.log('Retrieving postal code, INSEE code and city name... ');
    const cities = buildCities({ csvData });
    console.log('✅');

    console.log('Inserting cities in database... ');
    trx = await knex.transaction();
    await trx('certification-cpf-cities').del();
    const batchInfo = await trx.batchInsert('certification-cpf-cities', cities);
    const insertedLines = _getInsertedLineNumber(batchInfo);
    console.log('✅');
    trx.commit();
    console.log(`Added lines: ${insertedLines}`);
    console.log('\nDone.');
  } catch (error) {
    if (trx) {
      trx.rollback();
    }
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  const filePath = process.argv[2];
  main(filePath).then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

function _getInsertedLineNumber(batchInfo) {
  return batchInfo.map(({ rowCount }) => rowCount).reduce((acc, count) => acc + count, 0);
}

module.exports = {
  buildCities,
};
