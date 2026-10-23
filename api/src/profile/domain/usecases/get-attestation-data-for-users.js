import { AttestationNotFoundError } from '../errors.js';

export async function getAttestationDataForUsers({
  attestationKey,
  userIds,
  locale,
  userRepository,
  profileRewardRepository,
  attestationRepository,
  stringUtils,
  attestationStorage,
}) {
  const template = await attestationRepository.getDataByKey({ key: attestationKey, attestationStorage });

  if (!template) {
    throw new AttestationNotFoundError();
  }
  const users = await userRepository.getByIds({ userIds });

  const profileRewards = await profileRewardRepository.getByAttestationKeyAndUserIds({ attestationKey, userIds });

  return {
    data: profileRewards.map(({ userId, createdAt }) => {
      const user = users.find((user) => user.id === userId);
      return user.toForm(createdAt, locale, stringUtils.normalizeAndRemoveAccents);
    }),
    template,
  };
}
