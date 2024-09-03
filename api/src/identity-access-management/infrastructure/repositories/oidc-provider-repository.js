import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AlreadyExistingEntityError } from '../../../shared/domain/errors.js';
import * as knexUtils from '../../../shared/infrastructure/utils/knex-utils.js';
import { OidcProvider } from '../../domain/models/OidcProvider.js';

/**
 * @module OidcProviderRepository
 */

const OIDC_PROVIDERS_TABLE_NAME = 'oidc-providers';

/**
 * @param {Object} oidcProviderProperties
 * @param {string} oidcProviderProperties.accessTokenLifespan
 * @param {Object} oidcProviderProperties.additionalRequiredProperties
 * @param {Object} oidcProviderProperties.claimMapping
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
 * @returns {Promise<any[]>}
 */
const create = async function (oidcProviderProperties) {
  const knexConn = DomainTransaction.getConnection();
  try {
    const result = await knexConn(OIDC_PROVIDERS_TABLE_NAME).insert(oidcProviderProperties).returning('*');
    return result;
  } catch (err) {
    if (knexUtils.isUniqConstraintViolated(err)) {
      throw new AlreadyExistingEntityError();
    }
    throw err;
  }
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
