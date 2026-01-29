import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

const findFileNamesByStatus = async function ({ cpfImportStatus }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-courses-cpf-infos')
    .where({ importStatus: cpfImportStatus })
    .pluck('filename')
    .distinct();
};

export { findFileNamesByStatus };
