const { knex } = require('../../../db/knex-database-connection.js');

module.exports = {
  async create({ sessionId, userId }) {
    await knex('supervisor-accesses').insert({ sessionId, userId });
  },

  async isUserSupervisorForSession({ sessionId, userId }) {
    const result = await knex.select(1).from('supervisor-accesses').where({ sessionId, userId }).first();
    return Boolean(result);
  },

  async sessionHasSupervisorAccess({ sessionId }) {
    const result = await knex.select(1).from('supervisor-accesses').where({ sessionId }).first();
    return Boolean(result);
  },

  async isUserSupervisorForSessionCandidate({ supervisorId, certificationCandidateId }) {
    const result = await knex
      .select(1)
      .from('supervisor-accesses')
      .innerJoin('certification-candidates', 'supervisor-accesses.sessionId', 'certification-candidates.sessionId')
      .where({ 'certification-candidates.id': certificationCandidateId, 'supervisor-accesses.userId': supervisorId })
      .first();
    return Boolean(result);
  },
};
