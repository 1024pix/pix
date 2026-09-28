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
  attestationStorage,
}) {
  const attestationData = await attestationRepository.getDataByKey({ key: attestationKey, attestationStorage });

  if (!attestationData) {
    throw new AttestationNotFoundError();
  }

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

  const users = await userRepository.getByIds({ userIds: filteredProfileRewards.map(({ userId }) => userId) });
  const profileRewardByUserId = new Map(
    filteredProfileRewards.map((profileReward) => [profileReward.userId, profileReward]),
  );

  const sortByLastNameThenFirstName = (userA, userB) => {
    const lastNameComparison = userA.lastName.localeCompare(userB.lastName, 'fr', { sensitivity: 'base' });
    return lastNameComparison !== 0
      ? lastNameComparison
      : userA.firstName.localeCompare(userB.firstName, 'fr', {
          sensitivity: 'base',
        });
  };

  const usersToAttestationForm = (attestationForms, user) => {
    const profileReward = profileRewardByUserId.get(user.id);
    if (profileReward) {
      attestationForms.push(user.toForm(profileReward.createdAt, locale, stringUtils.normalizeAndRemoveAccents));
    }
    return attestationForms;
  };

  const data = users.toSorted(sortByLastNameThenFirstName).reduce(usersToAttestationForm, []);

  return {
    data,
    template: attestationData,
  };
}
