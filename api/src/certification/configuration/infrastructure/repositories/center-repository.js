import { config } from '../../../../shared/config.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { DEFAULT_PAGINATION, fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';

/**
 * @param {Object} params
 * @param {number} params.pageNumber - page number to fetch, default 1
 */
export const findSCOV2Centers = async function ({ pageNumber = DEFAULT_PAGINATION.PAGE } = {}) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn
    .from('certification-centers')
    .select('certification-centers.id')
    .where({ isV3Pilot: false, type: CERTIFICATION_CENTER_TYPES.SCO })
    .whereNotIn('certification-centers.externalId', config.features.pixCertifScoBlockedAccessWhitelist);

  const { results, pagination } = await fetchPage(query, { number: pageNumber });

  return { centerIds: results.map(({ id }) => id), pagination };
};

/**
 * @param {Object} params
 * @param {Array<number>} params.externalIds
 * @returns {Promise<void>}
 */
export const addToWhitelistByExternalIds = async ({ externalIds }) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-centers')
    .update({ isScoBlockedAccessWhitelist: true, updatedAt: knexConn.fn.now() })
    .where({ type: CERTIFICATION_CENTER_TYPES.SCO })
    .whereIn('externalId', externalIds);
};

/**
 * @returns {Promise<void>}
 */
export const resetWhitelist = async () => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-centers')
    .update({ isScoBlockedAccessWhitelist: false, updatedAt: knexConn.fn.now() })
    .where({ type: CERTIFICATION_CENTER_TYPES.SCO });
};
