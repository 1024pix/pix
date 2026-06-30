import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { batchUpdate } from '../../../shared/infrastructure/utils/knex-utils.js';
import { OrganizationProfileReward } from '../../domain/models/OrganizationProfileReward.js';

export const save = async ({ organizationId, profileRewardId }) => {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('organizations-profile-rewards')
    .insert({
      organizationId,
      profileRewardId,
    })
    .onConflict()
    .ignore();
};

/**
 * @type {function}
 * @param {Array<OrganizationProfileReward>} organizationProfileRewards
 * @returns {Promise<void>}
 */
export const removeInBatch = async (organizationProfileRewards) => {
  await batchUpdate({
    tableName: 'organizations-profile-rewards',
    primaryKeyName: 'id',
    rows: organizationProfileRewards.map((organizationProfileReward) => ({
      id: organizationProfileReward.id,
      profileRewardId: null,
    })),
  });
};

export const getByOrganizationId = async ({ attestationKey, organizationId }) => {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn('organizations-profile-rewards')
    .select(
      'organizations-profile-rewards.id',
      'organizations-profile-rewards.organizationId',
      'organizations-profile-rewards.profileRewardId',
      'profile-rewards.userId',
    )
    .join('profile-rewards', 'organizations-profile-rewards.profileRewardId', '=', 'profile-rewards.id')
    .where({ organizationId });

  if (attestationKey !== undefined) {
    query.join('attestations', 'profile-rewards.rewardId', '=', 'attestations.id').where({ key: attestationKey });
  }

  const organizationProfileRewards = await query;
  return organizationProfileRewards.map(
    (organizationProfileReward) => new OrganizationProfileReward(organizationProfileReward),
  );
};
