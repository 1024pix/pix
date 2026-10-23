import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';
import { databaseBuffer } from '../database-buffer.ts';

const OIDC_PROVIDERS_TABLE_NAME = 'oidc-providers';

export async function buildOidcProvider({
  id = databaseBuffer.getNextId(),
  accessTokenLifespan,
  additionalRequiredProperties,
  application,
  applicationTld,
  claimMapping,
  claimsToStore,
  clientId,
  clientSecret,
  connectionMethodCode,
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
  isVisible,
}) {
  const encryptedClientSecret = await cryptoService.encrypt(clientSecret);

  const values = {
    id,
    accessTokenLifespan,
    additionalRequiredProperties,
    application,
    applicationTld,
    claimMapping,
    claimsToStore,
    clientId,
    connectionMethodCode,
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
    isVisible,
  };

  return databaseBuffer.pushInsertable({
    tableName: OIDC_PROVIDERS_TABLE_NAME,
    values,
  });
}
