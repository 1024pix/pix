/**
 * @module OrganizationFeatureRepository
 */
import { knex } from '../../../../db/knex-database-connection.js';
import * as knexUtils from '../../../../src/shared/infrastructure/utils/knex-utils.js';
import { AlreadyExistingOrganizationFeatureError, FeatureNotFound, OrganizationNotFound } from '../../domain/errors.js';
import { OrganizationFeatureItem } from '../../domain/models/OrganizationFeatureItem.js';

/**
 * @typedef {import('../../domain/models/OrganizationFeature.js').OrganizationFeature} OrganizationFeature
 */
/**
 * @typedef {import('../../domain/models/OrganizationFeatureItem.js').OrganizationFeatureItem} OrganizationFeatureItem
 */

const DEFAULT_BATCH_SIZE = 100;

/**
 **
 * @param {OrganizationFeature[]} organizations
 */
async function saveInBatch(organizationFeatures, batchSize = DEFAULT_BATCH_SIZE) {
  try {
    await knex.batchInsert('organization-features', organizationFeatures, batchSize);
  } catch (err) {
    if (knexUtils.isUniqConstraintViolated(err)) {
      throw new AlreadyExistingOrganizationFeatureError();
    }

    if (knexUtils.foreignKeyConstraintViolated(err) && err.constraint.includes('featureid')) {
      throw new FeatureNotFound();
    }

    if (knexUtils.foreignKeyConstraintViolated(err) && err.constraint.includes('organizationid')) {
      throw new OrganizationNotFound();
    }
  }
}

/**
 * @typedef GetOrganizationFeaturePayload
 * @type {object}
 * @property {number} organizationId
 */

/**
 * @function
 * @name findAllOrganizationFeaturesFromOrganizationId
 *
 * @param {GetOrganizationFeaturePayload} payload
 * @returns {Promise<OrganizationFeatureItem>}
 */
async function findAllOrganizationFeaturesFromOrganizationId({ organizationId }) {
  const organizationFeatures = await knex
    .select('key', 'params')
    .from('organization-features')
    .join('features', 'features.id', 'organization-features.featureId')
    .where({ organizationId });

  return organizationFeatures.map((organizationFeature) => new OrganizationFeatureItem(organizationFeature));
}

export { findAllOrganizationFeaturesFromOrganizationId, saveInBatch };
