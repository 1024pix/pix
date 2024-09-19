import { PROFILE_REWARDS_TABLE_NAME } from '../../../../db/migrations/20240820101213_add-profile-rewards-table.js';
import { REWARD_TYPES } from '../../../quest/domain/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

/**
 * @param {number} userId
 * @param {number} rewardId
 * @param {('ATTESTATION')} rewardType
 * @returns {Promise<*>}
 */
export const save = async ({ userId, rewardId, rewardType = REWARD_TYPES.ATTESTATION }) => {
  const knexConnection = await DomainTransaction.getConnection();
  return knexConnection(PROFILE_REWARDS_TABLE_NAME).insert({
    userId,
    rewardId,
    rewardType,
  });
};
