import { PROFILE_REWARDS_TABLE_NAME } from '../../../../db/migrations/20240820101213_add-profile-rewards-table.js';
import { REWARD_TYPES } from '../../../quest/domain/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ProfileReward } from '../../domain/models/ProfileReward.js';

/**
 * @param {number} userId
 * @param {number} rewardId
 * @param {('ATTESTATION')} rewardType
 * @returns {Promise<*>}
 */
export const save = async ({ userId, rewardId, rewardType = REWARD_TYPES.ATTESTATION }) => {
  const knexConnection = await DomainTransaction.getConnection();
  await knexConnection(PROFILE_REWARDS_TABLE_NAME).insert({
    userId,
    rewardId,
    rewardType,
  });
};

/**
 * @param {number} userId
 * @returns {Promise<*>}
 */
export const getByUserId = async ({ userId }) => {
  const knexConnection = await DomainTransaction.getConnection();
  const profileRewards = await knexConnection(PROFILE_REWARDS_TABLE_NAME).where({ userId });
  return profileRewards.map(toDomain);
};

const toDomain = (profileReward) => {
  return new ProfileReward(profileReward);
};
