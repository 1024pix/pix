import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { oidcAuthenticationServiceRegistry, usecases } from '../../../domain/usecases/index.js';
import * as oidcSerializer from '../../../infrastructure/serializers/jsonapi/oidc-serializer.js';
import { BadRequestError, UnauthorizedError } from '../../http-errors.js';

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
    oidcAuthenticationServiceRegistry,
  },
) {
  const { identityProvider, authenticationKey } = request.deserializedPayload;

  await dependencies.oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await dependencies.oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = dependencies.oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
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
    oidcAuthenticationServiceRegistry,
  },
) {
  const { identity_provider: identityProvider, audience } = request.query;

  await dependencies.oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await dependencies.oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = dependencies.oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    audience,
  });
  const { nonce, state, ...payload } = oidcAuthenticationService.getAuthorizationUrl();

  request.yar.set('state', state);
  request.yar.set('nonce', nonce);
  await request.yar.commit(h);

  return h.response(payload).code(200);
};

const authenticateUser = async function (
  request,
  h,
  dependencies = {
    oidcAuthenticationServiceRegistry,
  },
) {
  const { code, identityProvider, redirectUri, state, audience } = request.deserializedPayload;

  const sessionState = request.yar.get('state', true);
  const nonce = request.yar.get('nonce', true);
  await request.yar.commit(h);

  if (sessionState === null) {
    throw new BadRequestError('Required cookie "state" is missing');
  }

  await dependencies.oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await dependencies.oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = dependencies.oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode: identityProvider,
    audience,
  });

  const result = await usecases.authenticateOidcUser({
    audience,
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
    oidcAuthenticationServiceRegistry,
  },
) {
  const { identityProvider, authenticationKey } = request.deserializedPayload;
  const localeFromCookie = request.state?.locale;

  await dependencies.oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await dependencies.oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProvider);

  const oidcAuthenticationService = dependencies.oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
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
};

const oidcController = {
  authenticateUser,
  createUser,
  findUserForReconciliation,
  getAuthorizationUrl,
  reconcileUser,
  reconcileUserForAdmin,
};

export { oidcController };
