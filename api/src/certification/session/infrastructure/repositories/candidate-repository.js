import { knex } from '../../../../../db/knex-database-connection.js';
import { Candidate } from '../../domain/models/Candidate.js';

const findBySessionId = async function (sessionId) {
  const results = await knex
    .select({
      certificationCandidate: 'certification-candidates.*',
      complementaryCertificationId: 'complementary-certification-subscriptions.complementaryCertificationId',
    })
    .from('certification-candidates')
    .where({ 'certification-candidates.sessionId': sessionId })
    .leftJoin(
      'complementary-certification-subscriptions',
      'certification-candidates.id',
      'complementary-certification-subscriptions.certificationCandidateId',
    )
    .groupBy('certification-candidates.id', 'complementary-certification-subscriptions.complementaryCertificationId')
    .orderByRaw('LOWER("certification-candidates"."lastName") asc')
    .orderByRaw('LOWER("certification-candidates"."firstName") asc');
  return results.map(_toDomain);
};

export { findBySessionId };

function _toDomain(result) {
  return result ? new Candidate(result) : null;
}
