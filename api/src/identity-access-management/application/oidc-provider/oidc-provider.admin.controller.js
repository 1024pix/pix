import { getForwardedOrigin, RequestedApplication } from '../../../shared/infrastructure/utils/network.js';
import { oidcAuthenticationServiceRegistry, usecases } from '../../domain/usecases/index.js';
import { addOidcProviderValidator } from '../../domain/validators/add-oidc-provider.validator.js';
import { oidcIdentityProvidersSerializer } from '../../infrastructure/serializers/jsonapi/oidc-identity-providers.serializer.js';

/**
 * @param request
 * @param h
 * @returns {Promise<*>}
 */
async function getImportTemplate(request, h) {
  return h
    .response(addOidcProviderValidator.getImportTemplate())
    .header('Content-Type', 'text/plain; charset=utf-8')
    .header('content-disposition', 'filename=oidc-providers-import.json')
    .code(200);
}

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
async function createInBatch(request, h) {
  const oidcProviders = request.payload;
  for (const oidcProvider of oidcProviders) {
    await usecases.addOidcProvider(oidcProvider);
  }
  return h.response().code(204);
}

/**
 * @param request
 * @param h
 * @return {Promise<*>}
 */
async function getAllIdentityProvidersForAdmin(request, h) {
  const identityProviders = await usecases.getAllIdentityProviders();
  return h.response(oidcIdentityProvidersSerializer.serialize(identityProviders)).code(200);
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
  const origin = getForwardedOrigin(request.headers);
  const requestedApplication = RequestedApplication.fromOrigin(origin);

  const oidcAuthenticationService = await dependencies.oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    requestedApplication,
  });

  const accessToken = await usecases.reconcileOidcUserForAdmin({
    email,
    identityProvider,
    authenticationKey,
    oidcAuthenticationService,
    audience: origin,
    requestedApplication,
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
export const oidcProviderAdminController = {
  getImportTemplate,
  createInBatch,
  getAllIdentityProvidersForAdmin,
  reconcileUserForAdmin,
};
