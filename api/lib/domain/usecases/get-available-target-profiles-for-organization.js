export default function ({ organizationId, TargetProfileForSpecifierRepository }) {
  return TargetProfileForSpecifierRepository.availableForOrganization(organizationId);
}
