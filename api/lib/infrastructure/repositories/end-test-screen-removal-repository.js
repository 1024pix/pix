const { featureToggles } = require('../../config');
const { knex } = require('../../../db/knex-database-connection');

function isEndTestScreenRemovalEnabledByCertificationCenterId(certificationCenterId) {
  const { allowedCertificationCenterIdsForEndTestScreenRemoval } = featureToggles;
  return allowedCertificationCenterIdsForEndTestScreenRemoval.includes(certificationCenterId);
}

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

async function isEndTestScreenRemovalEnabledByCandidateId(certificationCandidateId) {
  const { allowedCertificationCenterIdsForEndTestScreenRemoval } = featureToggles;

  if (allowedCertificationCenterIdsForEndTestScreenRemoval.length === 0) return false;

  const [{ count }] = await knex
    .select(1)
    .from('sessions')
    .innerJoin('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
    .innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .where({ 'certification-candidates.id': certificationCandidateId })
    .whereIn('certification-centers.id', allowedCertificationCenterIdsForEndTestScreenRemoval)
    .count();

  return Boolean(count);
}

function isEndTestScreenRemovalEnabledForSomeCertificationCenter() {
  const { allowedCertificationCenterIdsForEndTestScreenRemoval } = featureToggles;
  return allowedCertificationCenterIdsForEndTestScreenRemoval.length > 0;
}

module.exports = {
  isEndTestScreenRemovalEnabledBySessionId,
  isEndTestScreenRemovalEnabledByCandidateId,
  isEndTestScreenRemovalEnabledByCertificationCenterId,
  isEndTestScreenRemovalEnabledForSomeCertificationCenter,
};
