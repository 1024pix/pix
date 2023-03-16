const dotenv = require('dotenv');
dotenv.config();
const _ = require('lodash');
const { knex, disconnect } = require('../../../db/knex-database-connection');
const logger = require('../../../lib/infrastructure/logger');
const { learningContentCache } = require('../../../lib/infrastructure/caches/learning-content-cache');
const { autoMigrateTargetProfile } = require('./common');

async function main() {
  try {
    const dryRun = process.env.DRY_RUN === 'true';
    await doJob(dryRun);
  } catch (err) {
    logger.error(err);
    throw err;
  } finally {
    await disconnect();
    await learningContentCache.quit();
  }
}

async function doJob(dryRun) {
  const targetProfileIds = await _findTargetProfileIdsToConvert();
  if (targetProfileIds.length === 0) {
    logger.info('Aucun profil cible à convertir.');
    return;
  }
  logger.info(`${targetProfileIds.length} à convertir...`);
  for (const targetProfileId of targetProfileIds) {
    const trx = await knex.transaction();
    try {
      logger.info(`Conversion de ${targetProfileId}...`);
      await _convertTargetProfile(targetProfileId, trx);
      if (dryRun) await trx.rollback();
      else await trx.commit();
    } catch (err) {
      logger.error(`${targetProfileId} Echec. Raison : ${err}`);
      await trx.rollback();
    }
  }
}

async function _findTargetProfileIdsToConvert() {
  const ids = await knex('target-profiles')
    .pluck('target-profiles.id')
    .leftJoin('target-profile_tubes', 'target-profile_tubes.targetProfileId', 'target-profiles.id')
    .whereNull('target-profile_tubes.id');
  return _.uniq(ids);
}

async function _convertTargetProfile(targetProfileId, trx) {
  return autoMigrateTargetProfile(targetProfileId, trx);
}

if (require.main === module) {
  main();
}

module.exports = {
  doJob,
};
