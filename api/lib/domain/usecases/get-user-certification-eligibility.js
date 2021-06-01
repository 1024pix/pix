const CertificationEligilibility = require('../read-models/CertificationEligibility');

module.exports = async function getUserCertificationEligibility({
  userId,
  placementProfileService,
}) {
  const now = new Date();
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: now });
  return new CertificationEligilibility({
    id: userId,
    pixCertificationEligible: placementProfile.isCertifiable(),
  });
};
