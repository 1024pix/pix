#! /usr/bin/env node
require('dotenv').config();
const bluebird = require('bluebird');
const groupBy = require('lodash/groupBy');
const sum = require('lodash/sum');
const has = require('lodash/has');
const partition = require('lodash/partition');
const negate = require('lodash/negate');

const { readCsvFile, parseCsvData } = require('../helpers/csvHelpers');
const { categories } = require('../../lib/domain/models/TargetProfile');
const { knex } = require('../../db/knex-database-connection');

const TARGET_PROFILE_ID_COLUMN = 'targetProfileId';
const CATEGORY_COLUMN = 'category';

async function main() {
  console.log('Starting script select-category-for-target-profiles');

  console.log('Reading csv file... ');
  const filePath = process.argv[2];
  const csvData = await readCsvFile(filePath);
  console.log('✅ ok');

  console.log('Setting categories on target profiles...');
  const { totalUpdatedRows, invalidCategories, invalidTargetProfiles } = await setCategoriesToTargetProfiles(csvData);
  if (invalidCategories.length > 0) {
    console.log(`⚠️ Les catégories "${invalidCategories.join('", "')}" ne sont pas supportées`);
  }
  if (invalidTargetProfiles.length > 0) {
    console.log(`⚠️ Les ids de profils cibles "${invalidTargetProfiles.join('", "')}" ne sont pas valides`);
  }
  console.log(`✅ ${totalUpdatedRows} target profiles were updated.`);
}

async function setCategoriesToTargetProfiles(csvData) {
  const parsedCsvData = await parseCsvData(csvData, {
    header: true,
    delimiter: ',',
    skipEmptyLines: true,
  });

  const firstRow = parsedCsvData[0];
  if (!has(firstRow, CATEGORY_COLUMN) || !has(firstRow, TARGET_PROFILE_ID_COLUMN)) {
    throw new Error(`Les colonnes "${CATEGORY_COLUMN}" et "${TARGET_PROFILE_ID_COLUMN}" sont obligatoires`);
  }

  const targetProfilesGroupedByCategory = groupBy(parsedCsvData, CATEGORY_COLUMN);
  const parsedCategories = Object.keys(targetProfilesGroupedByCategory);

  const invalidCategories = parsedCategories.filter(negate(_isSupportedCategory));
  const validCategories = parsedCategories.filter(_isSupportedCategory);
  let invalidTargetProfiles = [];

  const result = await bluebird.mapSeries(validCategories, function (category) {
    const targetProfiles = targetProfilesGroupedByCategory[category].map((row) => row[TARGET_PROFILE_ID_COLUMN]);
    const [validTargetProfilesIds, invalidTargetProfilesIds] = partition(targetProfiles, (targetProfileId) =>
      Number.isInteger(parseInt(targetProfileId))
    );
    invalidTargetProfiles = [...invalidTargetProfiles, ...invalidTargetProfilesIds];

    return setCategoryToTargetProfiles(category, validTargetProfilesIds);
  });

  return { totalUpdatedRows: sum(result), invalidCategories, invalidTargetProfiles };
}

if (require.main === module) {
  main()
    .then(function () {
      console.log('🎉 Everything went fine !');
      process.exit(0);
    })
    .catch(function (error) {
      console.error('❌ Something went wrong...');
      console.error(error);
      process.exit(1);
    });
}

async function setCategoryToTargetProfiles(category, targetProfileIds) {
  return knex('target-profiles').whereIn('id', targetProfileIds).update({
    category,
  });
}

function _isSupportedCategory(category) {
  const supportedCategories = Object.values(categories);
  return supportedCategories.includes(category);
}

module.exports = {
  setCategoriesToTargetProfiles,
  setCategoryToTargetProfiles,
};
