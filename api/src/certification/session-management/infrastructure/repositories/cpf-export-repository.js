import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

export async function findFileNamesByStatus({ cpfImportStatus }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-courses-cpf-infos')
    .where({ importStatus: cpfImportStatus })
    .pluck('filename')
    .distinct();
}
