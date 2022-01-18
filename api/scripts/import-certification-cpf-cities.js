#!/usr/bin/env node

// Usage: node import-certification-cpf-cities path/file.csv
// File downloaded from https://www.data.gouv.fr/fr/datasets/base-officielle-des-codes-postaux/

'use strict';
const { parseCsv, checkCsvHeader } = require('./helpers/csvHelpers');
const { knex } = require('../lib/infrastructure/bookshelf');
const uniqBy = require('lodash/uniqBy');
const values = require('lodash/values');

const specificCities = [
  {
    name: 'PARIS',
    postalCode: 75000,
    INSEECode: 75056,
    isActualName: true,
  },
  {
    name: 'LYON',
    postalCode: 69000,
    INSEECode: 69123,
    isActualName: true,
  },
  {
    name: 'MARSEILLE',
    postalCode: 13000,
    INSEECode: 13055,
    isActualName: true,
  },
];

const headers = {
  cityName: 'nom_de_la_commune',
  postalCode: 'code_postal',
  INSEECode: 'code_commune_insee',
  cityAlternateName: 'ligne_5',
};

function buildCities({ csvData }) {
  const citiesWithAlternates = csvData.flatMap((data) => {
    const result = [];
    result.push({
      name: data[headers.cityName],
      postalCode: data[headers.postalCode],
      INSEECode: data[headers.INSEECode],
      isActualName: true,
    });

    if (data[headers.cityAlternateName]) {
      result.push({
        name: data[headers.cityAlternateName],
        postalCode: data[headers.postalCode],
        INSEECode: data[headers.INSEECode],
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
    console.log(`Checking ${filePath} data file...`);
    await checkCsvHeader({ filePath, requiredFieldNames: values(headers) });
    console.log('✅');

    console.log('Reading and parsing csv data file... ');
    const csvData = await parseCsv(filePath, { header: true, delimiter: ';', skipEmptyLines: true });
    console.log('✅');

    console.log('Retrieving postal code, INSEE code and city name... ');
    const cities = buildCities({ csvData }).concat(specificCities);
    console.log('✅');

    console.log('Inserting cities in database... ');
    trx = await knex.transaction();
    await trx('certification-cpf-cities').del();
    const batchInfo = await trx.batchInsert('certification-cpf-cities', cities);
    const insertedLines = _getInsertedLineNumber(batchInfo);
    console.log('✅');
    trx.commit();
    console.log(`Added lines: ${insertedLines} (${specificCities.length} exception cases)`);
    console.log('Done.');
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
