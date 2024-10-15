import { AttestationNotFoundError } from '../errors.js';

export async function getAttestationDataForUsers({
  attestationKey,
  userIds,
  locale,
  userRepository,
  profileRewardRepository,
  attestationRepository,
}) {
  const users = await userRepository.getByIds({ userIds });
  const profileRewards = await profileRewardRepository.getByAttestationKeyAndUserIds({ attestationKey, userIds });

  const attestationData = await attestationRepository.getByKey({ attestationKey });

  if (!attestationData) {
    throw new AttestationNotFoundError();
  }

  return {
    data: profileRewards.map(({ userId, createdAt }) => {
      const user = users.find((user) => user.id === userId);
      return user.toForm(createdAt, locale);
    }),
    templateName: attestationData.templateName,
  };
}
