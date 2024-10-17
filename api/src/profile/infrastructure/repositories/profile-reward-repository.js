import { PROFILE_REWARDS_TABLE_NAME } from '../../../../db/migrations/20240820101213_add-profile-rewards-table.js';
import { REWARD_TYPES } from '../../../quest/domain/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ProfileReward } from '../../domain/models/ProfileReward.js';

const ATTESTATIONS_TABLE_NAME = 'attestations';

/**
 * @param {Object} args
 * @param {number} args.userId
 * @param {number} args.rewardId
 * @param {('ATTESTATION')} args.rewardType
 * @returns {Promise<void>}
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
 * @param {Object} args
 * @param {number} args.userId
 * @returns {Promise<Array<ProfileReward>>}
 */
export const getByUserId = async ({ userId }) => {
  const knexConnection = await DomainTransaction.getConnection();
  const profileRewards = await knexConnection(PROFILE_REWARDS_TABLE_NAME).where({ userId });
  return profileRewards.map(toDomain);
};

/**
 * @param {Object} args
 * @param {string} args.attestationKey
 * @param {Array<number>} args.userIds
 * @returns {Promise<Array<ProfileReward>>}
 */
export const getByAttestationKeyAndUserIds = async ({ attestationKey, userIds }) => {
  const knexConnection = await DomainTransaction.getConnection();
  const profileRewards = await knexConnection(PROFILE_REWARDS_TABLE_NAME)
    .select(PROFILE_REWARDS_TABLE_NAME + '.*')
    .join(ATTESTATIONS_TABLE_NAME, ATTESTATIONS_TABLE_NAME + '.id', PROFILE_REWARDS_TABLE_NAME + '.rewardId')
    .whereIn('userId', userIds)
    .where(ATTESTATIONS_TABLE_NAME + '.key', attestationKey)
    .orderBy('id');
  return profileRewards.map(toDomain);
};

const toDomain = (profileReward) => {
  return new ProfileReward(profileReward);
};
