import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const OIDC_PROVIDERS_TABLE_NAME = 'oidc-providers';

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
 * @param {Object} dependencies
 * @param {DomainTransaction} dependencies.domainTransaction
 * @returns {Promise<any[]>}
 */
const create = async function (
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
  dependencies = { domainTransaction: DomainTransaction.emptyTransaction() },
) {
  const knexConn = dependencies.domainTransaction.knexTransaction ?? knex;

  const oidcProviderProperties = {
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
  };

  return await knexConn(OIDC_PROVIDERS_TABLE_NAME).insert(oidcProviderProperties).returning('*');
};

export { create };
