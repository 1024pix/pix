import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
/**
 * @typedef {import ('../usecases/index.js').OidcProviderRepository} OidcProviderRepository
 */

/**
 * @param {Object} params
 * @param {string} params.accessTokenLifespan
 * @param {Object} params.additionalRequiredProperties
 * @param {string} params.claimsToStore
 * @param {string} params.clientId
 * @param {string} params.clientSecret
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
 * @param {OidcProviderRepository} params.oidcProviderRepository
 * @param {DomainTransaction} params.domainTransaction
 * @param {CryptoService} params.cryptoService
 * @returns {Promise<void>}
 */
const addOidcProvider = async function ({
  accessTokenLifespan,
  additionalRequiredProperties,
  claimsToStore,
  clientId,
  clientSecret,
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
  oidcProviderRepository,
  cryptoService,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const encryptedClientSecret = await cryptoService.encrypt(clientSecret);

  await oidcProviderRepository.create(
    {
      accessTokenLifespan,
      additionalRequiredProperties,
      claimsToStore,
      clientId,
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
    },
    { domainTransaction },
  );
};

export { addOidcProvider };
