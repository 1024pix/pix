import { withTransaction } from '../../../shared/domain/DomainTransaction.js';

/**
 * @typedef {import ('../usecases/index.js').OidcProviderRepository} OidcProviderRepository
 */

/**
 * @param {Object} params
 * @param {string} params.accessTokenLifespan
 * @param {Object} params.additionalRequiredProperties
 * @param {string} params.application
 * @param {string} params.applicationTld
 * @param {Object} params.claimMapping
 * @param {string} params.claimsToStore
 * @param {string} params.clientId
 * @param {string} params.clientSecret
 * @param {string} params.connectionMethodCode
 * @param {boolean} params.enabled
 * @param {boolean} params.enabledForPixAdmin
 * @param {Object} params.extraAuthorizationUrlParameters
 * @param {string} params.identityProvider
 * @param {Object} params.openidClientExtraMetadata
 * @param {string} params.openidConfigurationUrl
 * @param {string} params.organizationName
 * @param {string} params.postLogoutRedirectUri
 * @param {string} params.redirectUri
 * @param {string} params.scope
 * @param {boolean} params.shouldCloseSession
 * @param {string} params.slug
 * @param {string} params.source
 * @param {boolean} params.isVisible
 * @param {OidcProviderRepository} params.oidcProviderRepository
 * @param {CryptoService} params.cryptoService
 * @returns {Promise<void>}
 */
export const addOidcProvider = withTransaction(async function ({
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
  oidcProviderRepository,
  cryptoService,
  addOidcProviderValidator,
}) {
  const properties = {
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
  };
  addOidcProviderValidator.validate(properties);

  const encryptedClientSecret = await cryptoService.encrypt(clientSecret);
  // eslint-disable-next-line no-unused-vars -- extract clientSecret because only the encrypted value is stored
  const { clientSecret: _, ...propertiesWithoutClientSecret } = properties;
  const propertiesWithEncryptedClientSecret = { encryptedClientSecret, ...propertiesWithoutClientSecret };

  await oidcProviderRepository.create(propertiesWithEncryptedClientSecret);
});
