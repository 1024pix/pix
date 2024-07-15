import { usecases } from '../../domain/usecases/index.js';
import { OrganizationLearner } from './models/OrganizationLearner.js';

/**
 * @module OrganizationLearnerApi
 */

/**
 * @typedef PageDefinition
 * @type {object}
 * @property {number} size
 * @property {Page} number
 */

/**
 * @typedef FilterDefinition
 * @type {object}
 * @property {Array<string>} divisions
 * @property {string} name
 */

/**
 * @typedef OrganizationLearnerListPayload
 * @type {object}
 * @property {number} organizationId
 * @property {(PageDefinition|undefined)} page
 * @propery {(FilterDefinition|undefined)} filter
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
 * @type {object}
 * @property {Array<OrganizationLearner>} organizationLearners
 * @property {(Pagination|undefined)} pagination
 */

/**
 * @function
 * @name find
 * @description
 * Récupère les organization-learners pour une organization. Par défaut, ces organizations-learners sont triés par prénom puis par nom.
 * Si le params 'page' est présent, les organization-learners seront paginés
 * Si le params 'filter' est présent, les organization-learners seront filtrés
 * @param {OrganizationLearnerListPayload} payload
 * @returns {Promise<OrganizationLearnerListResponse>}
 */
export const find = async ({ organizationId, page, filter }) => {
  if (page) {
    const { learners, pagination } = await usecases.findPaginatedOrganizationLearners({
      organizationId,
      page,
      filter: _fromAPIModel(filter),
    });
    return { organizationLearners: _toAPIModel(learners), pagination };
  } else {
    const allLearners = await _getLearnerWithoutPagination({ organizationId, filter: _fromAPIModel(filter) });

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

function _fromAPIModel(filter) {
  const filterMappings = {
    divisions: 'Libellé classe',
    name: 'name',
  };
  return filter
    ? Object.entries(filter).reduce((acc, [key, value]) => {
        return { ...acc, [filterMappings[key]]: value };
      }, {})
    : undefined;
}

async function _getLearnerWithoutPagination({ organizationId, filter }) {
  const allLearners = [];
  let call = 1;
  let totalPages;

  do {
    const { learners, pagination } = await usecases.findPaginatedOrganizationLearners({
      organizationId,
      page: { size: 100, number: call },
      filter,
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
