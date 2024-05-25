import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { oidcAuthenticationServiceRegistry, usecases } from '../../../domain/usecases/index.js';

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
  reconcileUserForAdmin,
};

export { oidcController };
