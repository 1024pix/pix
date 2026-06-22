import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ResultRecipient } from '../../domain/read-models/ResultRecipient.js';

export async function get({ sessionId, resultRecipientEmail }) {
  const knexConn = DomainTransaction.getConnection();
  const candidateIds = await knexConn
    .pluck('id')
    .from('certification-candidates')
    .where('sessionId', sessionId)
    .whereILike('resultRecipientEmail', resultRecipientEmail);
  return new ResultRecipient({ sessionId, resultRecipientEmail, candidateIds });
}
