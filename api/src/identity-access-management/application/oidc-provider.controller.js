import { usecases } from '../domain/usecases/index.js';
import * as oidcProviderSerializer from '../infrastructure/serializers/jsonapi/oidc-identity-providers.serializer.js';

/**
 * @typedef {function} getIdentityProviders
 * @param request
 * @param h
 * @return {Promise<*>}
 */
async function getIdentityProviders(request, h) {
  const audience = request.query.audience;
  const identityProviders = await usecases.getReadyIdentityProviders({ audience });
  return h.response(oidcProviderSerializer.serialize(identityProviders)).code(200);
}

/**
 * @typedef {function} getRedirectLogoutUrl
 * @param request
 * @param h
 * @return {Promise<Object>}
 */
async function getRedirectLogoutUrl(request, h) {
  const userId = request.auth.credentials.userId;
  const { identity_provider: identityProvider, logout_url_uuid: logoutUrlUUID } = request.query;

  const redirectLogoutUrl = await usecases.getRedirectLogoutUrl({
    identityProvider,
    logoutUrlUUID,
    userId,
  });

  return h.response({ redirectLogoutUrl }).code(200);
}

/**
 * @typedef {Object} OidcProviderController
 * @property {getIdentityProviders} getIdentityProviders
 * @property {getRedirectLogoutUrl} getRedirectLogoutUrl
 */
export const oidcProviderController = { getIdentityProviders, getRedirectLogoutUrl };
