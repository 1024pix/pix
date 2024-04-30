import { knex } from '../../../../../db/knex-database-connection.js';
import { Candidate } from '../../../session/domain/models/Candidate.js';

const findBySessionId = async function ({ sessionId }) {
  const results = await knex
    .select({
      certificationCandidate: 'certification-candidates.*',
      complementaryCertificationId: 'certification-subscriptions.complementaryCertificationId',
    })
    .from('certification-candidates')
    .where({ 'certification-candidates.sessionId': sessionId })
    .leftJoin(
      'certification-subscriptions',
      'certification-candidates.id',
      'certification-subscriptions.certificationCandidateId',
    )
    .groupBy('certification-candidates.id', 'certification-subscriptions.complementaryCertificationId')
    .orderByRaw('LOWER("certification-candidates"."lastName") asc')
    .orderByRaw('LOWER("certification-candidates"."firstName") asc');
  return results.map(_toDomain);
};

export { findBySessionId };

function _toDomain(result) {
  return result ? new Candidate(result) : null;
}
