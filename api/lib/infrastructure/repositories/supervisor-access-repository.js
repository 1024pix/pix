import { knex } from '../../../db/knex-database-connection.js';

const create = async function ({ sessionId, userId }) {
  await knex('supervisor-accesses').insert({ sessionId, userId });
};

const isUserSupervisorForSession = async function ({ sessionId, userId }) {
  const result = await knex.select(1).from('supervisor-accesses').where({ sessionId, userId }).first();
  return Boolean(result);
};

const sessionHasSupervisorAccess = async function ({ sessionId }) {
  const result = await knex.select(1).from('supervisor-accesses').where({ sessionId }).first();
  return Boolean(result);
};

const isUserSupervisorForSessionCandidate = async function ({ supervisorId, certificationCandidateId }) {
  const result = await knex
    .select(1)
    .from('supervisor-accesses')
    .innerJoin('certification-candidates', 'supervisor-accesses.sessionId', 'certification-candidates.sessionId')
    .where({ 'certification-candidates.id': certificationCandidateId, 'supervisor-accesses.userId': supervisorId })
    .first();
  return Boolean(result);
};

export { create, isUserSupervisorForSession, sessionHasSupervisorAccess, isUserSupervisorForSessionCandidate };
