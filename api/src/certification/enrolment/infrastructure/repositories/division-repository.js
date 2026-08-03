import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Division } from '../../domain/models/Division.js';

export async function findActiveDivisionsByOrganizationId({ organizationId }) {
  const knexConn = DomainTransaction.getConnection();

  const divisionRows = await knexConn('view-active-organization-learners')
    .distinct('division')
    .where({ organizationId, isDisabled: false })
    .whereNotNull('division')
    .orderBy('division', 'asc');

  return divisionRows.map(({ division }) => new Division({ name: division }));
}
