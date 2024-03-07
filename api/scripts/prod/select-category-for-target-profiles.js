import dotenv from 'dotenv';

dotenv.config();
import bluebird from 'bluebird';
import lodash from 'lodash';
const { groupBy, sum, has, partition, negate } = lodash;

import * as url from 'url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { categories } from '../../lib/domain/models/TargetProfile.js';
import { parseCsvData, readCsvFile } from '../helpers/csvHelpers.js';

const TARGET_PROFILE_ID_COLUMN = 'targetProfileId';
const CATEGORY_COLUMN = 'category';

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
      Number.isInteger(parseInt(targetProfileId)),
    );
    invalidTargetProfiles = [...invalidTargetProfiles, ...invalidTargetProfilesIds];

    return setCategoryToTargetProfiles(category, validTargetProfilesIds);
  });

  return { totalUpdatedRows: sum(result), invalidCategories, invalidTargetProfiles };
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

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

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

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
      console.log('🎉 Everything went fine !');
      process.exitCode = 0;
    } catch (error) {
      console.error('❌ Something went wrong...');
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { setCategoriesToTargetProfiles, setCategoryToTargetProfiles };
