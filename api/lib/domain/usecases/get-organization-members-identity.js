export default function getOrganizationMemberIdentities({ organizationId, organizationMemberIdentityRepository }) {
  return organizationMemberIdentityRepository.findAllByOrganizationId({ organizationId });
}
