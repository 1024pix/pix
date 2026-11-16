import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SessionForResultsSharing } from '../../domain/read-models/SessionForResultsSharing.js';

export async function get(sessionId) {
  const knexConn = DomainTransaction.getConnection();
  const sessionDTO = await knexConn
    .select('id', 'date', 'time', 'certificationCenter')
    .from('sessions')
    .where('id', sessionId)
    .first();
  return new SessionForResultsSharing(sessionDTO);
}

export async function findPublishedSessionIds({ sessionIds }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('sessions').whereIn('id', sessionIds).whereNotNull('publishedAt').pluck('id');
}
