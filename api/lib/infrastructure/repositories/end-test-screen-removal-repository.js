const { features } = require('../../config');
const { knex } = require('../../../db/knex-database-connection');

function isEndTestScreenRemovalEnabledByCertificationCenterId(certificationCenterId) {
  const { endTestScreenRemovalWhiteList } = features;
  return endTestScreenRemovalWhiteList.includes(certificationCenterId);
}

async function isEndTestScreenRemovalEnabledBySessionId(sessionId) {
  const { endTestScreenRemovalWhiteList } = features;

  if (endTestScreenRemovalWhiteList.length === 0) return false;

  const [{ count }] = await knex
    .select(1)
    .from('sessions')
    .where({ id: sessionId })
    .whereIn('certificationCenterId', endTestScreenRemovalWhiteList)
    .count();

  return Boolean(count);
}

async function isEndTestScreenRemovalEnabledByCandidateId(certificationCandidateId) {
  const { endTestScreenRemovalWhiteList } = features;

  if (endTestScreenRemovalWhiteList.length === 0) return false;

  const [{ count }] = await knex
    .select(1)
    .from('sessions')
    .innerJoin('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
    .where({ 'certification-candidates.id': certificationCandidateId })
    .whereIn('sessions.certificationCenterId', endTestScreenRemovalWhiteList)
    .count();

  return Boolean(count);
}

function isEndTestScreenRemovalEnabledForSomeCertificationCenter() {
  const { endTestScreenRemovalWhiteList } = features;
  return endTestScreenRemovalWhiteList.length > 0;
}

module.exports = {
  isEndTestScreenRemovalEnabledBySessionId,
  isEndTestScreenRemovalEnabledByCandidateId,
  isEndTestScreenRemovalEnabledByCertificationCenterId,
  isEndTestScreenRemovalEnabledForSomeCertificationCenter,
};
