import { usecases } from '../../domain/usecases/index.js';
import { OrganizationLearner } from './models/OrganizationLearner.js';

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
 * @property {(PageDefinition|undefined)} page
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
 * @typedef OrganizationLearner
 * @type {object}
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} division
 * @property {number} organizationId
 */

/**
 * @typedef OrganizationLearnerListResponse
 * Récupère les organization-learners pour une organization. Si le params 'page' est présent, les organization-learners seront paginés.
 * @type {object}
 * @property {Array<OrganizationLearner>} organizationLearners
 * @property {(Pagination|undefined)} pagination
 */

/**
 * @function
 * @name find
 * @param {OrganizationLearnerListPayload} payload
 * @returns {Promise<OrganizationLearnerListResponse>}
 */
export const find = async ({ organizationId, page }) => {
  if (page) {
    const { learners, pagination } = await usecases.findPaginatedOrganizationLearners({
      organizationId,
      page,
    });
    return { organizationLearners: _toAPIModel(learners), pagination };
  } else {
    const allLearners = await _getLearnerWithoutPagination(organizationId);

    return { organizationLearners: _toAPIModel(allLearners) };
  }
};

function _toAPIModel(input) {
  if (Array.isArray(input)) {
    return input.map((organizationLearner) => new OrganizationLearner(organizationLearner));
  } else {
    return new OrganizationLearner(input);
  }
}

async function _getLearnerWithoutPagination(organizationId) {
  const allLearners = [];
  let call = 1;
  let totalPages;

  do {
    const { learners, pagination } = await usecases.findPaginatedOrganizationLearners({
      organizationId,
      page: { size: 100, number: call },
    });
    totalPages = pagination.pageCount;
    allLearners.push(...learners);
    call++;
  } while (call <= totalPages);
  return allLearners;
}
/**
 * @function
 * @name get
 *
 * @param {number} organizationLearnerId
 * @returns {Promise<OrganizationLearner>}
 */

export const get = async (organizationLearnerId) => {
  const learner = await usecases.getOrganizationLearner({ organizationLearnerId });
  return _toAPIModel(learner);
};
