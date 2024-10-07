export async function getAttestationDataForUsers({
  attestationKey,
  userIds,
  locale,
  userRepository,
  profileRewardRepository,
}) {
  const users = await userRepository.getByIds({ userIds });
  const profileRewards = await profileRewardRepository.getByAttestationKeyAndUserIds({ attestationKey, userIds });

  return profileRewards.map(({ userId, createdAt }) => {
    const user = users.find((user) => user.id === userId);
    return user.toForm(createdAt, locale);
  });
}
