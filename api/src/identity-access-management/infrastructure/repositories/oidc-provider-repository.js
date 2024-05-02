/**
 * @module OidcProviderRepository
 */

import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { OidcProvider } from '../../domain/models/OidcProvider.js';

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
  return knexConn(OIDC_PROVIDERS_TABLE_NAME).insert(oidcProviderProperties).returning('*');
};

/**
 * @return {Promise<Array<OidcProvider>>}
 */
const findAllOidcProviders = async function () {
  const result = await knex.select().from(OIDC_PROVIDERS_TABLE_NAME);
  return result.map(_toDomain);
};

const oidcProviderRepository = { create, findAllOidcProviders };

export { oidcProviderRepository };

const _toDomain = (oidcProvider) => {
  return new OidcProvider(oidcProvider);
};
