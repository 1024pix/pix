/**
 * @module OrganizationFeatureRepository
 */
import * as knexUtils from '../../../../src/shared/infrastructure/utils/knex-utils.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { FeatureNotFound, OrganizationNotFound } from '../../domain/errors.js';
import { OrganizationFeatureItem } from '../../domain/models/OrganizationFeatureItem.js';

/**
 * @typedef {import('../../domain/models/OrganizationFeature.js').OrganizationFeature} OrganizationFeature
 */
/**
 * @typedef {import('../../domain/models/OrganizationFeatureItem.js').OrganizationFeatureItem} OrganizationFeatureItem
 */

/**
 **
 * @param {OrganizationFeature[]} organizations
 */
async function saveInBatch(organizationFeatures) {
  try {
    const knexConn = DomainTransaction.getConnection();
    await knexConn('organization-features')
      .insert(
        organizationFeatures.map(({ featureId, organizationId, params }) => ({
          featureId,
          organizationId,
          params: JSON.stringify(params),
        })),
      )
      .onConflict(['featureId', 'organizationId'])
      .merge();
  } catch (err) {
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
  const knexConn = DomainTransaction.getConnection();
  const organizationFeatures = await knexConn
    .select('key', 'params')
    .from('organization-features')
    .join('features', 'features.id', 'organization-features.featureId')
    .where({ organizationId });

  return organizationFeatures.map((organizationFeature) => new OrganizationFeatureItem(organizationFeature));
}

export { findAllOrganizationFeaturesFromOrganizationId, saveInBatch };
