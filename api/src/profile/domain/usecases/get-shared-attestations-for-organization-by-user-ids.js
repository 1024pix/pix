import { AttestationNotFoundError, NoProfileRewardsFoundError } from '../errors.js';

export async function getSharedAttestationsForOrganizationByUserIds({
  attestationKey,
  userIds,
  organizationId,
  locale,
  userRepository,
  profileRewardRepository,
  attestationRepository,
  organizationProfileRewardRepository,
  stringUtils,
}) {
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
