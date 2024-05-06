import { usecases } from '../domain/usecases/index.js';
import * as oidcProviderSerializer from '../infrastructure/serializers/jsonapi/oidc-identity-providers.serializer.js';

async function getIdentityProviders(request, h) {
  const audience = request.query.audience;
  const identityProviders = await usecases.getReadyIdentityProviders({ audience });
  return h.response(oidcProviderSerializer.serialize(identityProviders)).code(200);
}

/**
 * @typedef {Object} OidcProviderController
 * @property {getIdentityProviders} getIdentityProviders
 */
export const oidcProviderController = { getIdentityProviders };
