const { knex } = require('../../../db/knex-database-connection');

async function isEndTestScreenRemovalEnabledByCertificationCenterId(certificationCenterId) {
  const result = await knex
    .select(1)
    .from('certification-centers')
    .where({ id: certificationCenterId, isSupervisorAccessEnabled: true })
    .first();

  return Boolean(result);
}

async function isEndTestScreenRemovalEnabledBySessionId(sessionId) {
  const result = await knex
    .select(1)
    .from('sessions')
    .where({ 'sessions.id': sessionId, isSupervisorAccessEnabled: true })
    .innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .first();

  return Boolean(result);
}

async function isEndTestScreenRemovalEnabledByCandidateId(certificationCandidateId) {
  const result = await knex
    .select(1)
    .from('certification-candidates')
    .where({ 'certification-candidates.id': certificationCandidateId, isSupervisorAccessEnabled: true })
    .innerJoin('sessions', 'sessions.id', 'certification-candidates.sessionId')
    .innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .first();

  return Boolean(result);
}

async function isEndTestScreenRemovalEnabledForSomeCertificationCenter() {
  const result = await knex.select(1).from('certification-centers').where({ isSupervisorAccessEnabled: true }).first();

  return Boolean(result);
}

module.exports = {
  isEndTestScreenRemovalEnabledBySessionId,
  isEndTestScreenRemovalEnabledByCandidateId,
  isEndTestScreenRemovalEnabledByCertificationCenterId,
  isEndTestScreenRemovalEnabledForSomeCertificationCenter,
};
