'use strict';
require('dotenv').config();
const bluebird = require('bluebird');
const logger = require('../lib/infrastructure/logger');
const certificationBadgesService = require('../lib/domain/services/certification-badges-service');
const { knex } = require('../db/knex-database-connection');

/**
 * Usage: node scripts/check-clea-elligibility.js 456
 */
async function main() {
  logger.info("Début du script de verification d'éligibilité à la certification CléA Numérique");
  try {
    const sessionId = process.argv[2];
    const userIds = await _getUserIdsBySessionId(sessionId);
    const eligibilities = await _checkCleaElligibility(userIds);
    logger.info(`CléA Eligibilities for session ${sessionId}`);
    logger.info(_displayEligibilities(eligibilities));

    logger.info('Fin du script');
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(err.message);
      process.exit(1);
    });
}

module.exports = {};

function _displayEligibilities(eligibilities) {
  return eligibilities.map(({ userId, eligible }) => `user: ${userId} ${eligible ? '✅' : '❌'}`);
}
async function _getUserIdsBySessionId(sessionId) {
  const result = await knex.select('userId').from('certification-courses').where({ sessionId });
  return result?.map(({ userId }) => userId);
}
async function _checkCleaElligibility(userIds) {
  return bluebird.mapSeries(userIds, async (userId) => {
    const eligible = await certificationBadgesService.hasStillValidCleaBadgeAcquisition({ userId });
    return { userId, eligible };
  });
}
