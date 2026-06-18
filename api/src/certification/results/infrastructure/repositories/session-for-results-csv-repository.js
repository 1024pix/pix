import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SessionForResultsCsv } from '../../domain/read-models/SessionForResultsCsv.js';

export async function get(sessionId) {
  const knexConn = DomainTransaction.getConnection();
  const sessionDTO = await knexConn
    .select('id', 'date', 'time', 'certificationCenter')
    .from('sessions')
    .where('id', sessionId)
    .first();
  return new SessionForResultsCsv(sessionDTO);
}
