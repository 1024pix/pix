import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
/**
 * @typedef {import ('../usecases/index.js').OidcProviderRepository} OidcProviderRepository
 */

/**
 * @param {Object} params
 * @param {string} params.accessTokenLifespan
 * @param {string} params.claimsToStore
 * @param {string} params.clientId
 * @param {Object} params.customProperties
 * @param {Boolean} params.enabled
 * @param {Boolean} params.enabledForPixAdmin
 * @param {string} params.encryptedClientSecret
 * @param {Object} params.extraAuthorizationUrlParameters
 * @param {string} params.identityProvider
 * @param {string} params.idTokenLifespan
 * @param {Object} params.openidClientExtraMetadata
 * @param {string} params.openidConfigurationUrl
 * @param {string} params.organizationName
 * @param {string} params.postLogoutRedirectUri
 * @param {string} params.redirectUri
 * @param {string} params.scope
 * @param {string} params.slug
 * @param {string} params.source
 * @param {OidcProviderRepository} params.oidcProviderRepository
 * @param {DomainTransaction} params.domainTransaction
 * @returns {Promise<void>}
 */
const addOidcProvider = async function ({
  accessTokenLifespan,
  claimsToStore,
  clientId,
  customProperties,
  enabled,
  enabledForPixAdmin,
  encryptedClientSecret,
  extraAuthorizationUrlParameters,
  identityProvider,
  idTokenLifespan,
  openidClientExtraMetadata,
  openidConfigurationUrl,
  organizationName,
  postLogoutRedirectUri,
  redirectUri,
  scope,
  slug,
  source,
  oidcProviderRepository,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  await oidcProviderRepository.create(
    {
      accessTokenLifespan,
      claimsToStore,
      clientId,
      customProperties,
      enabled,
      enabledForPixAdmin,
      encryptedClientSecret,
      extraAuthorizationUrlParameters,
      identityProvider,
      idTokenLifespan,
      openidClientExtraMetadata,
      openidConfigurationUrl,
      organizationName,
      postLogoutRedirectUri,
      redirectUri,
      scope,
      slug,
      source,
    },
    { domainTransaction },
  );
};

export { addOidcProvider };
