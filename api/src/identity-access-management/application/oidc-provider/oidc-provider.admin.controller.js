import { oidcAuthenticationServiceRegistry } from '../../../../lib/domain/usecases/index.js';
import { PIX_ADMIN } from '../../../authorization/domain/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { usecases } from '../../domain/usecases/index.js';
import * as oidcProviderSerializer from '../../infrastructure/serializers/jsonapi/oidc-identity-providers.serializer.js';

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
async function createInBatch(request, h) {
  const oidcProviders = request.payload;

  await DomainTransaction.execute(() => {
    return Promise.all(oidcProviders.map((oidcProvider) => usecases.addOidcProvider({ ...oidcProvider })));
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
 * @param request
 * @param h
 * @param dependencies
 * @return {Promise<{access_token: string}>}
 */
async function reconcileUserForAdmin(
  request,
  h,
  dependencies = {
    oidcAuthenticationServiceRegistry,
  },
) {
  const { email, identityProvider, authenticationKey } = request.deserializedPayload;

  await dependencies.oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await dependencies.oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = dependencies.oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    audience: PIX_ADMIN.AUDIENCE,
  });

  const accessToken = await usecases.reconcileOidcUserForAdmin({
    email,
    identityProvider,
    authenticationKey,
    oidcAuthenticationService,
  });

  return h.response({ access_token: accessToken }).code(200);
}

/**
 * @typedef {{
 * reconcileUserForAdmin: (function(*, *, {oidcAuthenticationServiceRegistry: OidcAuthenticationServiceRegistry}=): Promise<*>),
 * createInBatch: (function(*, *): Promise<*>),
 * getAllIdentityProvidersForAdmin: (function(*, *): Promise<*>)
 * }} oidcProviderAdminController
 */
export const oidcProviderAdminController = { createInBatch, getAllIdentityProvidersForAdmin, reconcileUserForAdmin };
