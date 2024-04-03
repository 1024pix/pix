import * as cryptoService from '../../../src/shared/domain/services/crypto-service.js';
import { databaseBuffer } from '../database-buffer.js';

const OIDC_PROVIDERS_TABLE_NAME = 'oidc-providers';

export async function buildOidcProvider({
  id = databaseBuffer.getNextId(),
  accessTokenLifespan,
  claimsToStore,
  clientId,
  clientSecret,
  customProperties,
  enabled,
  enabledForPixAdmin,
  extraAuthorizationUrlParameters,
  identityProvider,
  openidClientExtraMetadata,
  openidConfigurationUrl,
  organizationName,
  postLogoutRedirectUri,
  redirectUri,
  scope,
  shouldCloseSession,
  slug,
  source,
}) {
  const encryptedClientSecret = await cryptoService.encrypt(clientSecret);

  const values = {
    id,
    accessTokenLifespan,
    claimsToStore,
    clientId,
    customProperties,
    enabled,
    enabledForPixAdmin,
    encryptedClientSecret,
    extraAuthorizationUrlParameters,
    identityProvider,
    openidClientExtraMetadata,
    openidConfigurationUrl,
    organizationName,
    postLogoutRedirectUri,
    redirectUri,
    scope,
    shouldCloseSession,
    slug,
    source,
  };

  return databaseBuffer.pushInsertable({
    tableName: OIDC_PROVIDERS_TABLE_NAME,
    values,
  });
}
