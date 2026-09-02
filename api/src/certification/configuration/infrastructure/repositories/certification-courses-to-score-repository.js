import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

export async function findIdsByVersionId({ versionId }) {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn('certification-courses')
    .select('certification-courses.id')
    .join('sessions', 'sessions.id', 'certification-courses.sessionId')
    .whereNotNull('sessions.finalizedAt')
    .where('certification-courses.versionId', versionId);
  return rows.map((row) => row.id);
}
