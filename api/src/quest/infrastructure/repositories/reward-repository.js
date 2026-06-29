export const getByAttestationKey = async ({ rewardApi, key }) => {
  return rewardApi.getByAttestationKey({ key });
};
