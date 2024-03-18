import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { oidcAuthenticationServiceRegistry as authenticationServiceRegistry } from '../../../domain/services/authentication/authentication-service-registry.js';
import { usecases } from '../../../domain/usecases/index.js';
import * as oidcProviderSerializer from '../../../infrastructure/serializers/jsonapi/oidc-identity-providers-serializer.js';
import * as oidcSerializer from '../../../infrastructure/serializers/jsonapi/oidc-serializer.js';
import { UnauthorizedError } from '../../http-errors.js';

const getAllIdentityProvidersForAdmin = async function (request, h) {
  const identityProviders = usecases.getAllIdentityProviders();
  return h.response(oidcProviderSerializer.serialize(identityProviders)).code(200);
};

const getIdentityProviders = async function (request, h) {
  const audience = request.query.audience;
  const identityProviders = usecases.getReadyIdentityProviders({ audience });
  return h.response(oidcProviderSerializer.serialize(identityProviders)).code(200);
};

const getRedirectLogoutUrl = async function (
  request,
  h,
  dependencies = {
    authenticationServiceRegistry,
  },
) {
  const userId = request.auth.credentials.userId;
  const { identity_provider: identityProvider, logout_url_uuid: logoutUrlUUID } = request.query;
  const oidcAuthenticationService = dependencies.authenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
  });
  const redirectLogoutUrl = await oidcAuthenticationService.getRedirectLogoutUrl({
    userId,
    logoutUrlUUID,
  });

  return h.response({ redirectLogoutUrl }).code(200);
};

const findUserForReconciliation = async function (
  request,
  h,
  dependencies = {
    oidcSerializer,
  },
) {
  const { email, password, identityProvider, authenticationKey } = request.deserializedPayload;

  const result = await usecases.findUserForOidcReconciliation({
    email,
    password,
    identityProvider,
    authenticationKey,
  });

  return h.response(dependencies.oidcSerializer.serialize(result)).code(200);
};

const reconcileUser = async function (
  request,
  h,
  dependencies = {
    authenticationServiceRegistry,
  },
) {
  const { identityProvider, authenticationKey } = request.deserializedPayload;
  const oidcAuthenticationService = dependencies.authenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
  });

  const result = await usecases.reconcileOidcUser({
    authenticationKey,
    oidcAuthenticationService,
  });

  return h.response({ access_token: result.accessToken, logout_url_uuid: result.logoutUrlUUID }).code(200);
};

const getAuthorizationUrl = async function (
  request,
  h,
  dependencies = {
    authenticationServiceRegistry,
  },
) {
  const { identity_provider: identityProvider, audience } = request.query;
  const oidcAuthenticationService = dependencies.authenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    audience,
  });
  const { nonce, state, ...payload } = oidcAuthenticationService.getAuthorizationUrl({
    redirectUri: request.query['redirect_uri'],
  });

  request.yar.set('state', state);
  request.yar.set('nonce', nonce);
  await request.yar.commit(h);

  return h.response(payload).code(200);
};

const authenticateUser = async function (
  request,
  h,
  dependencies = {
    authenticationServiceRegistry,
  },
) {
  const { code, identityProvider, redirectUri, state, audience } = request.deserializedPayload;

  const sessionState = request.yar.get('state', true);
  const nonce = request.yar.get('nonce', true);
  await request.yar.commit(h);

  const oidcAuthenticationService = dependencies.authenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    audience,
  });

  const result = await usecases.authenticateOidcUser({
    code,
    redirectUri,
    state,
    sessionState,
    nonce,
    oidcAuthenticationService,
  });

  if (result.isAuthenticationComplete) {
    return h.response({ access_token: result.pixAccessToken, logout_url_uuid: result.logoutUrlUUID }).code(200);
  } else {
    const message = "L'utilisateur n'a pas de compte Pix";
    const responseCode = 'SHOULD_VALIDATE_CGU';
    const { authenticationKey, givenName, familyName, email } = result;
    const meta = { authenticationKey, givenName, familyName };
    if (email) Object.assign(meta, { email });
    throw new UnauthorizedError(message, responseCode, meta);
  }
};

const createUser = async function (
  request,
  h,
  dependencies = {
    authenticationServiceRegistry,
  },
) {
  const { identityProvider, authenticationKey } = request.deserializedPayload;
  const localeFromCookie = request.state?.locale;

  const oidcAuthenticationService = dependencies.authenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
  });
  const { accessToken, logoutUrlUUID } = await usecases.createOidcUser({
    authenticationKey,
    identityProvider,
    localeFromCookie,
    oidcAuthenticationService,
  });

  const response = { access_token: accessToken, logout_url_uuid: logoutUrlUUID };
  return h.response(response).code(200);
};

const reconcileUserForAdmin = async function (
  request,
  h,
  dependencies = {
    authenticationServiceRegistry,
  },
) {
  const { email, identityProvider, authenticationKey } = request.deserializedPayload;

  const oidcAuthenticationService = dependencies.authenticationServiceRegistry.getOidcProviderServiceByCode({
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
};

const oidcController = {
  authenticateUser,
  createUser,
  findUserForReconciliation,
  getAllIdentityProvidersForAdmin,
  getAuthorizationUrl,
  getIdentityProviders,
  getRedirectLogoutUrl,
  reconcileUser,
  reconcileUserForAdmin,
};

export { oidcController };
