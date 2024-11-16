import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CenterTypes } from '../../domain/models/CenterTypes.js';

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
