import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

export const getAttestationZipForDivisions = async ({
  attestationKey,
  organizationId,
  divisions,
  organizationLearnerRepository = injectedRepositories.organizationLearnerRepository,
} = {}) => {
  const organizationLearners = await organizationLearnerRepository.findOrganizationLearnersByDivisions({
    organizationId,
    divisions,
  });

  return organizationLearnerRepository.getAttestationsForOrganizationLearnersAndKey({
    attestationKey,
    organizationLearners,
    organizationId,
  });
};
