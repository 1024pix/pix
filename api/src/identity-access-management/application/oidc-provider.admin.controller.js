import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases } from '../domain/usecases/index.js';

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
 * @typedef OidcProviderController
 * @type {object}
 * @property {createInBatch} createInBatch
 */
export const oidcProviderAdminController = { createInBatch };
