import * as injectedStringUtils from '../../../shared/infrastructure/utils/string-utils.js';
import * as injectedAttestationRepository from '../../infrastructure/repositories/attestation-repository.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
import * as injectedOrganizationProfileRewardRepository from '../../infrastructure/repositories/organizations-profile-reward-repository.js';
import * as injectedProfileRewardRepository from '../../infrastructure/repositories/profile-reward-repository.js';
import { AttestationNotFoundError, NoProfileRewardsFoundError } from '../errors.js';

export async function getSharedAttestationsForOrganizationByUserIds({
  attestationKey,
  userIds,
  organizationId,
  locale,
  userRepository = injectedRepositories.userRepository,
  profileRewardRepository = injectedProfileRewardRepository,
  attestationRepository = injectedAttestationRepository,
  organizationProfileRewardRepository = injectedOrganizationProfileRewardRepository,
  stringUtils = injectedStringUtils,
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
  const filteredProfileRewards = profileRewards.filter((profileReward) => userIds.includes(profileReward.userId));

  if (filteredProfileRewards.length === 0) {
    throw new NoProfileRewardsFoundError();
  }

  const data = [];

  filteredProfileRewards.forEach(({ userId, createdAt }) => {
    const user = users.find((user) => user.id === userId);
    if (user) data.push(user.toForm(createdAt, locale, stringUtils.normalizeAndRemoveAccents));
  });

  return {
    data,
    templateName: attestationData.templateName,
  };
}
