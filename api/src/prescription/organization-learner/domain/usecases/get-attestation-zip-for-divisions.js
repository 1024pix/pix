export const getAttestationZipForDivisions = async ({
  attestationKey,
  organizationId,
  divisions,
  organizationLearnerRepository,
}) => {
  const organizationLearners = await organizationLearnerRepository.findOrganizationLearnersByDivisions({
    organizationId,
    divisions,
  });

  return organizationLearnerRepository.getAttestationsForOrganizationLearnersAndKey({
    attestationKey,
    organizationLearners,
  });
};
