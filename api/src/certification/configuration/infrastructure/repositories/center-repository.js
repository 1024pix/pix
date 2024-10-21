import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { DEFAULT_PAGINATION } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { Center } from '../../domain/models/Center.js';
import { CenterTypes } from '../../domain/models/CenterTypes.js';

/**
 * @param {Object} params
 * @param {number} params.[cursorId] - identifies the primary identifier above with the results will be taken (cursor pagination). If empty, will start from beginning
 * @param {number} params.[size] - number of centers to fetch
 * @returns {Array<Center>} centers primary identifiers found ordered by ascending identifiers
 */
export const findSCOV2Centers = async function ({ cursorId, size = DEFAULT_PAGINATION.PAGE_SIZE } = {}) {
  logger.debug('cursorId:[%o]', cursorId);
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn
    .from('certification-centers')
    .select('certification-centers.id', 'certification-centers.externalId')
    .where({ isV3Pilot: false, type: CenterTypes.SCO })
    .orderBy('certification-centers.id', 'ASC')
    .limit(size);

  if (cursorId) {
    query.andWhere('certification-centers.id', '>', cursorId);
  }

  const results = await query;
  return results.map(({ id, externalId }) => _toDomain({ id, externalId, type: CenterTypes.SCO }));
};

const _toDomain = ({ id, externalId, type }) => {
  return new Center({ id, externalId, type });
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
    .where({ type: CenterTypes.SCO })
    .whereIn('externalId', externalIds);
};

/**
 * @returns {Promise<void>}
 */
export const resetWhitelist = async () => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-centers')
    .update({ isScoBlockedAccessWhitelist: false, updatedAt: knexConn.fn.now() })
    .where({ type: CenterTypes.SCO });
};

/**
 * @param {Object} params
 * @param {Array<number>} params.preservedCenterIds
 * @returns {Promise<number>} updated centers count
 */
export const updateCentersToV3 = async ({ preservedCenterIds }) => {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn('certification-centers')
    .update({ isV3Pilot: true, updatedAt: knexConn.fn.now() }, ['id'])
    .where({ isV3Pilot: false })
    .whereNotIn('id', preservedCenterIds);

  return results.length;
};

/**
 * @param {Object} params
 * @param {Array<number>} params.preservedCenterIds
 * @returns {Promise<Array<number>>} v2 center ids excluding preservedCenterIds
 */
export const findV2CenterIds = async ({ preservedCenterIds }) => {
  const knexConn = DomainTransaction.getConnection();
  const centers = await knexConn('certification-centers')
    .select('id')
    .where({ isV3Pilot: false })
    .whereNotIn('id', preservedCenterIds);

  return centers.map(({ id }) => id);
};
