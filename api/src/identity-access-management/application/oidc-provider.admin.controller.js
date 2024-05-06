import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases } from '../domain/usecases/index.js';
import * as oidcProviderSerializer from '../infrastructure/serializers/jsonapi/oidc-identity-providers.serializer.js';

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
async function createInBatch(request, h) {
  const oidcProviders = request.payload;

  await DomainTransaction.execute((domainTransaction) => {
    return Promise.all(
      oidcProviders.map((oidcProvider) => usecases.addOidcProvider({ ...oidcProvider, domainTransaction })),
    );
  });

  return h.response().code(204);
}

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
async function getAllIdentityProvidersForAdmin(request, h) {
  const identityProviders = await usecases.getAllIdentityProviders();
  return h.response(oidcProviderSerializer.serialize(identityProviders)).code(200);
}

/**
 * @typedef {Object} OidcProviderAdminController
 * @property {createInBatch} createInBatch
 * @property {getAllIdentityProvidersForAdmin} getAllIdentityProvidersForAdmin
 */
export const oidcProviderAdminController = { createInBatch, getAllIdentityProvidersForAdmin };
