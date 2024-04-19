import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const OIDC_PROVIDERS_TABLE_NAME = 'oidc-providers';

/**
 * @param {Object} oidcProviderProperties
 * @param {string} oidcProviderProperties.accessTokenLifespan
 * @param {Object} oidcProviderProperties.additionalRequiredProperties
 * @param {string} oidcProviderProperties.claimsToStore
 * @param {string} oidcProviderProperties.clientId
 * @param {boolean} oidcProviderProperties.enabled
 * @param {boolean} oidcProviderProperties.enabledForPixAdmin
 * @param {string} oidcProviderProperties.encryptedClientSecret
 * @param {Object} oidcProviderProperties.extraAuthorizationUrlParameters
 * @param {string} oidcProviderProperties.identityProvider
 * @param {Object} oidcProviderProperties.openidClientExtraMetadata
 * @param {string} oidcProviderProperties.openidConfigurationUrl
 * @param {string} oidcProviderProperties.organizationName
 * @param {string} oidcProviderProperties.postLogoutRedirectUri
 * @param {string} oidcProviderProperties.redirectUri
 * @param {string} oidcProviderProperties.scope
 * @param {boolean} oidcProviderProperties.shouldCloseSession
 * @param {string} oidcProviderProperties.slug
 * @param {string} oidcProviderProperties.source
 * @param {Object} dependencies
 * @param {DomainTransaction} dependencies.domainTransaction
 * @returns {Promise<any[]>}
 */
const create = async function (
  oidcProviderProperties,
  dependencies = { domainTransaction: DomainTransaction.emptyTransaction() },
) {
  const knexConn = dependencies.domainTransaction.knexTransaction ?? knex;
  return await knexConn(OIDC_PROVIDERS_TABLE_NAME).insert(oidcProviderProperties).returning('*');
};

export { create };
