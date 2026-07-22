import { REWARD_TYPES } from '../../../quest/domain/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ProfileReward } from '../../domain/models/ProfileReward.js';

/**
 * @param {Object} args
 * @param {number} args.userId
 * @param {number} args.rewardId
 * @param {('ATTESTATION')} args.rewardType
 * @returns {Promise<void>}
 */
export const save = async ({ userId, rewardId, rewardType = REWARD_TYPES.ATTESTATION }) => {
  const knexConnection = await DomainTransaction.getConnection();
  await knexConnection('profile-rewards')
    .insert({
      userId,
      rewardId,
      rewardType,
    })
    .onConflict()
    .ignore();
};

/**
 * @param {Object} args
 * @param {number} args.userId
 * @returns {Promise<Array<ProfileReward>>}
 */
export const getByUserId = async ({ userId }) => {
  const knexConnection = await DomainTransaction.getConnection();
  const profileRewards = await knexConnection('profile-rewards').where({ userId });
  return profileRewards.map(toDomain);
};

/**
 * @param {Object} args
 * @param {number} args.profileRewardId
 * @returns {Promise<ProfileReward>}
 */
export const getById = async ({ profileRewardId }) => {
  const knexConnection = await DomainTransaction.getConnection();
  const profileReward = await knexConnection('profile-rewards').where({ id: profileRewardId }).first();

  return profileReward ? toDomain(profileReward) : null;
};

/**
 * @param {Object} args
 * @param {number} args.profileRewardIds
 * @returns {Promise<Array<ProfileReward>>}
 */
export const getByIds = async ({ profileRewardIds }) => {
  const knexConnection = await DomainTransaction.getConnection();
  const profileRewards = await knexConnection('profile-rewards').whereIn('id', profileRewardIds);

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
  const profileRewards = await knexConnection('profile-rewards')
    .select('profile-rewards.*')
    .join('attestations', 'attestations.id', 'profile-rewards.rewardId')
    .whereIn('userId', userIds)
    .where('attestations.key', attestationKey)
    .orderBy('id');
  return profileRewards.map(toDomain);
};

export const findByUserIdAndRewardId = async ({ rewardId, userId }) => {
  const knexConn = DomainTransaction.getConnection();

  const profileReward = await knexConn('profile-rewards').where({ rewardId, userId }).first();

  return profileReward ? toDomain(profileReward) : null;
};

export const findByUserIdsAndRewardId = async ({ rewardId, userIds }) => {
  const knexConn = DomainTransaction.getConnection();

  const profileRewards = await knexConn('profile-rewards').whereIn('userId', userIds).where({ rewardId });

  return profileRewards.map(toDomain);
};

const toDomain = (profileReward) => {
  return new ProfileReward(profileReward);
};
