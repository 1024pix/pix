module.exports = async function updateMembership({
  membershipId,
  membership,
  membershipRepository,
  certificationCenterRepository,
  certificationCenterMembershipRepository,
}) {
  membership.validateRole();

  if (membership.isAdmin) {
    const existingMembership = await membershipRepository.get(membershipId);
    const existingCertificationCenter = await certificationCenterRepository.getByExternalId({ externalId: existingMembership.organization.externalId });

    if (existingCertificationCenter) {
      certificationCenterMembershipRepository.save(existingMembership.user.id, existingCertificationCenter.id);
    }
  }

  return membershipRepository.updateById({ id: membershipId, membership });
};
