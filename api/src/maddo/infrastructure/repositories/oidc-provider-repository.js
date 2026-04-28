import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

export async function findOidcProviderClaims(identityProvider) {
  const knexConn = DomainTransaction.getConnection();

  const oidcProvider = await knexConn('oidc-providers').select('claimsToStore').where({ identityProvider }).first();
  if (!oidcProvider) return [];

  return oidcProvider.claimsToStore?.split(',') ?? [];
}
