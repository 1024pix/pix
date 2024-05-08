import { usecases } from '../../domain/usecases/index.js';
import * as oidcProviderSerializer from '../../infrastructure/serializers/jsonapi/oidc-identity-providers.serializer.js';

/**
 * @typedef {function} createUser
 * @param request
 * @param h
 * @return {Promise<{access_token: string, logout_url_uuid: string}>}
 */
async function createUser(request, h) {
  const { identityProvider, authenticationKey } = request.deserializedPayload;
  const localeFromCookie = request.state?.locale;

  const { accessToken: access_token, logoutUrlUUID: logout_url_uuid } = await usecases.createOidcUser({
    authenticationKey,
    identityProvider,
    localeFromCookie,
  });

  return h.response({ access_token, logout_url_uuid }).code(200);
}

/**
 * @typedef {function} getAuthorizationUrl
 * @param request
 * @param h
 * @return {Promise<Object>}
 */
async function getAuthorizationUrl(request, h) {
  const { identity_provider: identityProvider, audience } = request.query;

  const { nonce, state, ...payload } = await usecases.getAuthorizationUrl({ audience, identityProvider });

  request.yar.set('state', state);
  request.yar.set('nonce', nonce);
  await request.yar.commit(h);

  return h.response(payload).code(200);
}

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
 * @property {getAuthorizationUrl} getAuthorizationUrl
 * @property {getIdentityProviders} getIdentityProviders
 * @property {getRedirectLogoutUrl} getRedirectLogoutUrl
 */
export const oidcProviderController = { createUser, getAuthorizationUrl, getIdentityProviders, getRedirectLogoutUrl };
