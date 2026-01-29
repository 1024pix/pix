import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

export async function getJurisdiction(clientId) {
  const knexConn = DomainTransaction.getConnection();
  const clientApplication = await knexConn('client_applications').select('jurisdiction').where({ clientId }).first();
  return clientApplication.jurisdiction;
}
