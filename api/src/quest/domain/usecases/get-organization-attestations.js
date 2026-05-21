export const getOrganizationAttestations = async ({ organizationId, attestationRepository }) => {
  return attestationRepository.getAllByOrganizationId({ organizationId });
};
