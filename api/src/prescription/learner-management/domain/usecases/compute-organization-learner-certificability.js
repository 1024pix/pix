import * as injectedPlacementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
const computeOrganizationLearnerCertificability = async function ({
  organizationLearnerId,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
  placementProfileService = injectedPlacementProfileService,
} = {}) {
  const organizationLearner = await organizationLearnerRepository.getLearnerInfo(organizationLearnerId);

  const placementProfile = await placementProfileService.getPlacementProfile({
    userId: organizationLearner.userId,
    limitDate: new Date().toISOString(),
  });

  await organizationLearner.updateCertificability(placementProfile);

  await organizationLearnerRepository.updateCertificability(organizationLearner);
};

export { computeOrganizationLearnerCertificability };
