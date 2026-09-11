import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { InvigilatorSession } from '../../domain/read-models/InvigilatorSession.js';

export async function get({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const foundSession = await knexConn
    .select('invigilatorPassword', 'finalizedAt')
    .from('sessions')
    .where({ id })
    .first();
  if (!foundSession) {
    throw new NotFoundError('Session not found.');
  }
  return new InvigilatorSession({ ...foundSession });
}
