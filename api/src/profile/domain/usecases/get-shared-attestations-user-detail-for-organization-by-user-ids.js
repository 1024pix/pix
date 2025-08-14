import * as injectedAttestationRepository from '../../infrastructure/repositories/attestation-repository.js';
import * as injectedOrganizationProfileRewardRepository from '../../infrastructure/repositories/organizations-profile-reward-repository.js';
import * as injectedProfileRewardRepository from '../../infrastructure/repositories/profile-reward-repository.js';
import { AttestationNotFoundError } from '../errors.js';
import { AttestationUserDetail } from '../models/AttestationUserDetail.js';

export async function getSharedAttestationsUserDetailForOrganizationByUserIds({
  attestationKey,
  userIds,
  organizationId,
  userRepository,
  profileRewardRepository = injectedProfileRewardRepository,
  attestationRepository = injectedAttestationRepository,
  organizationProfileRewardRepository = injectedOrganizationProfileRewardRepository,
} = {}) {
  const attestationData = await attestationRepository.getByKey({ attestationKey });

  if (!attestationData) {
    throw new AttestationNotFoundError();
  }

  const users = await userRepository.getByIds({ userIds });

  const sharedProfileRewards = await organizationProfileRewardRepository.getByOrganizationId({
    attestationKey,
    organizationId,
  });
  const profileRewardIds = sharedProfileRewards.map((sharedProfileReward) => sharedProfileReward.profileRewardId);

  const profileRewards = await profileRewardRepository.getByIds({ profileRewardIds });

  const filteredUsers = users.filter((user) => !user.isAnonymous && !user.hasBeenAnonymised);

  return profileRewards
    .filter((profileReward) => _hasActiveUser(profileReward, filteredUsers))
    .map((profileReward) => {
      return new AttestationUserDetail({
        attestationKey,
        obtainedAt: profileReward.createdAt,
        userId: profileReward.userId,
      });
    });
}

function _hasActiveUser(profileReward, activeUsers) {
  return activeUsers.some(({ id }) => id === profileReward.userId);
}
