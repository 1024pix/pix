const { featureToggles } = require('../../config');
const { knex } = require('../../../db/knex-database-connection');

async function isEndTestScreenRemovalEnabledBySessionId(sessionId) {
  const { allowedCertificationCenterIdsForEndTestScreenRemoval } = featureToggles;

  if (allowedCertificationCenterIdsForEndTestScreenRemoval.length === 0) return false;

  const [{ count }] = await knex
    .select(1)
    .from('sessions')
    .innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .where({ 'sessions.id': sessionId })
    .whereIn('certification-centers.id', allowedCertificationCenterIdsForEndTestScreenRemoval)
    .count();

  return Boolean(count);
}

module.exports = {
  isEndTestScreenRemovalEnabledBySessionId,
};
