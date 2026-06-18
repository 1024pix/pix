import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ResultRecipient } from '../../domain/read-models/ResultRecipient.js';

export async function get({ sessionId, resultRecipientEmail }) {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn
    .select('id')
    .from('certification-candidates')
    .where('sessionId', sessionId)
    .whereRaw('lower("resultRecipientEmail") = ?', [resultRecipientEmail.toLowerCase()]);
  const candidateIds = rows.map((row) => row.id);
  return new ResultRecipient({ sessionId, resultRecipientEmail, candidateIds });
}
