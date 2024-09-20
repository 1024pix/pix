export const getProfileRewardsByUserId = async function ({ userId, profileRewardRepository }) {
  return profileRewardRepository.getByUserId({ userId });
};
