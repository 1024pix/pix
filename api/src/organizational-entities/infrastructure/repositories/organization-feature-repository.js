/**
 * @module OrganizationFeatureRepository
 */

import { knex } from '../../../../db/knex-database-connection.js';
import * as knexUtils from '../../../../src/shared/infrastructure/utils/knex-utils.js';
import { AlreadyExistingOrganizationFeatureError, FeatureNotFound, OrganizationNotFound } from '../../domain/errors.js';

/**
 * @typedef {import('../../domain/models/OrganizationFeature.js').OrganizationFeature} OrganizationFeature
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

export { saveInBatch };
