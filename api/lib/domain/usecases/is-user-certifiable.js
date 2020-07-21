module.exports = async function isUserCertifiable({
  userId,
  placementProfileService,
}) {
  const now = new Date();
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: now });
  return placementProfile.isCertifiable();
};
