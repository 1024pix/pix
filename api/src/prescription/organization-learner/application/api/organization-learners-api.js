import { usecases } from '../../domain/usecases/index.js';
import { OrganizationLearnerListItem } from './models/OrganizationLearnerListItem.js';

/**
 * @typedef PageDefinition
 * @type {object}
 * @property {number} size
 * @property {Page} number
 */

/**
 * @typedef OrganizationLearnerListPayload
 * @type {object}
 * @property {number} organizationId
 * @property {PageDefinition} page
 */

/**
 * @typedef Pagination
 * @type {object}
 * @property {number} page
 * @property {number} pageSize
 * @property {number} rowCount
 * @property {number} pageCount
 */

/**
 * @typedef OrganizationLearnerListResponse
 * @type {object}
 * @property {Array<OrganizationLeanerListItem>} learners
 * @property {Pagination} pagination
 */

/**
 * @function
 * @name findPaginatedOrganizationLearners
 *
 * @param {OrganizationLearnerListPayload} payload
 * @returns {Promise<OrganizationLearnerListResponse>}
 */
export const findPaginatedOrganizationLearners = async ({ organizationId, page = {} }) => {
  const result = await usecases.findPaginatedOrganizationLearners({ organizationId, page });

  const organizationLearnersList = result.learners.map((learner) => new OrganizationLearnerListItem(learner));

  return { learners: organizationLearnersList, pagination: result.pagination };
};
