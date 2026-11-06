import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';
import { databaseBuffer } from '../database-buffer.ts';

const OIDC_PROVIDERS_TABLE_NAME = 'oidc-providers';

// The jsonb columns take any JSON value.
type OidcProviderAttributes = {
  id?: number;
  accessTokenLifespan?: string;
  additionalRequiredProperties?: unknown;
  application?: string | null;
  applicationTld?: string | null;
  claimMapping?: unknown;
  claimsToStore?: string | null;
  clientId?: string;
  clientSecret: string;
  connectionMethodCode?: string | null;
  enabled?: boolean;
  enabledForPixAdmin?: boolean;
  extraAuthorizationUrlParameters?: unknown;
  identityProvider?: string;
  openidClientExtraMetadata?: unknown;
  openidConfigurationUrl?: string;
  organizationName?: string;
  postLogoutRedirectUri?: string | null;
  redirectUri?: string;
  scope?: string;
  shouldCloseSession?: boolean;
  slug?: string;
  source?: string;
  isVisible?: boolean | null;
};

const buildOidcProvider = async ({
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
}: OidcProviderAttributes) => {
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

  return databaseBuffer.pushInsertable({ tableName: OIDC_PROVIDERS_TABLE_NAME, values });
};

export { buildOidcProvider };
