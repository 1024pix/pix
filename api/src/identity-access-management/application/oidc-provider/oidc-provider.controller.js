import { BadRequestError, UnauthorizedError } from '../../../shared/application/http-errors.js';
import { requestResponseUtils } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import * as oidcProviderSerializer from '../../infrastructure/serializers/jsonapi/oidc-identity-providers.serializer.js';
import * as oidcSerializer from '../../infrastructure/serializers/jsonapi/oidc-serializer.js';

/**
 * @typedef {function} authenticateOidcUser
 * @param request
 * @param h
 * @return {Promise<*>}
 */
async function authenticateOidcUser(request, h) {
  const { code, state, iss, identityProvider: identityProviderCode, audience } = request.deserializedPayload;

  const sessionState = request.yar.get('state', true);
  const nonce = request.yar.get('nonce', true);
  await request.yar.commit(h);

  if (sessionState === null) {
    throw new BadRequestError('Required cookie "state" is missing');
  }

  const result = await usecases.authenticateOidcUser({
    audience,
    code,
    state,
    iss,
    identityProviderCode,
    nonce,
    sessionState,
  });

  if (result.isAuthenticationComplete) {
    return h.response({ access_token: result.pixAccessToken, logout_url_uuid: result.logoutUrlUUID }).code(200);
  }

  // TODO utiliser un message en anglais au lieu du français
  const message = "L'utilisateur n'a pas de compte Pix";
  const responseCode = 'SHOULD_VALIDATE_CGU';
  const { authenticationKey, givenName, familyName, email } = result;
  const meta = { authenticationKey, givenName, familyName };

  if (email) {
    Object.assign(meta, { email });
  }

  throw new UnauthorizedError(message, responseCode, meta);
}

/**
 * @typedef {function} createUser
 * @param request
 * @param h
 * @return {Promise<{access_token: string, logout_url_uuid: string}>}
 */
async function createUser(request, h, dependencies = { requestResponseUtils }) {
  const { identityProvider, authenticationKey } = request.deserializedPayload;
  const localeFromCookie = request.state?.locale;
  const language = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const { accessToken: access_token, logoutUrlUUID: logout_url_uuid } = await usecases.createOidcUser({
    authenticationKey,
    identityProvider,
    localeFromCookie,
    language,
  });

  return h.response({ access_token, logout_url_uuid }).code(200);
}

/**
 * @param request
 * @param h
 * @param dependencies
 * @return {Promise<*>}
 */
async function findUserForReconciliation(request, h, dependencies = { oidcSerializer }) {
  const { email, password, identityProvider, authenticationKey } = request.deserializedPayload;

  const result = await usecases.findUserForOidcReconciliation({
    email,
    password,
    identityProvider,
    authenticationKey,
  });

  return h.response(dependencies.oidcSerializer.serialize(result)).code(200);
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
 * @callback reconcileUser
 * @param request
 * @param h
 * @return {Promise<{access_token: string, logout_url_uuid: string}>}
 */
async function reconcileUser(request, h) {
  const { identityProvider, authenticationKey } = request.deserializedPayload;

  const result = await usecases.reconcileOidcUser({
    authenticationKey,
    identityProvider,
  });

  return h.response({ access_token: result.accessToken, logout_url_uuid: result.logoutUrlUUID }).code(200);
}

/**
 * @typedef {Object} OidcProviderController
 * @property {authenticateOidcUser} authenticateOidcUser
 * @property {findUserForReconciliation} findUserForReconciliation
 * @property {getAuthorizationUrl} getAuthorizationUrl
 * @property {getIdentityProviders} getIdentityProviders
 * @property {getRedirectLogoutUrl} getRedirectLogoutUrl
 * @property {reconcileUser} reconcileUser
 */
export const oidcProviderController = {
  authenticateOidcUser,
  createUser,
  findUserForReconciliation,
  getAuthorizationUrl,
  getIdentityProviders,
  getRedirectLogoutUrl,
  reconcileUser,
};
