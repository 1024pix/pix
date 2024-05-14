import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { oidcAuthenticationServiceRegistry, usecases } from '../../../domain/usecases/index.js';
import * as oidcSerializer from '../../../infrastructure/serializers/jsonapi/oidc-serializer.js';

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
  findUserForReconciliation,
  reconcileUser,
  reconcileUserForAdmin,
};

export { oidcController };
