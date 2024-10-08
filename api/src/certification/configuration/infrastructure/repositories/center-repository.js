import { config } from '../../../../shared/config.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { DEFAULT_PAGINATION } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';

/**
 * @param {Object} params
 * @param {number} params.[cursorId] - identifies the primary identifier above with the results will be taken (cursor pagination). If empty, will start from beginning
 * @param {number} params.[size] - number of centers to fetch
 * @returns {Array<number>} centers primary identifiers found ordered by ascending identifiers
 */
export const findSCOV2Centers = async function ({ cursorId, size = DEFAULT_PAGINATION.PAGE_SIZE } = {}) {
  logger.debug('cursorId:[%o]', cursorId);
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn
    .from('certification-centers')
    .select('certification-centers.id')
    .where({ isV3Pilot: false, type: CERTIFICATION_CENTER_TYPES.SCO })
    .andWhere((queryBuilder) => {
      queryBuilder
        .whereRaw('UPPER(TRIM("certification-centers"."externalId")) NOT IN (?)', _getWhitelist())
        .orWhereNull('certification-centers.externalId')
        .orWhereRaw('TRIM("certification-centers"."externalId") = \'\'');
    })
    .orderBy('certification-centers.id', 'ASC')
    .limit(size);

  if (cursorId) {
    query.andWhere('certification-centers.id', '>', cursorId);
  }

  return (await query).map(({ id }) => id);
};

const _getWhitelist = () => {
  const whitelist = config.features.pixCertifScoBlockedAccessWhitelist;
  logger.debug('SCO Whitelist:[%o]', whitelist);
  return whitelist.join(',');
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
