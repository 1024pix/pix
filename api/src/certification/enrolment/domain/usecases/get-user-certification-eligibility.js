import { UserCertificationEligibility } from '../read-models/UserCertificationEligibility.js';

const getUserCertificationEligibility = async function ({ userId, limitDate, placementProfileService }) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate });
  return new UserCertificationEligibility({
    id: userId,
    isCertifiable: placementProfile.isCertifiable(),
    certificationEligibilities: [],
  });
};

export { getUserCertificationEligibility };
