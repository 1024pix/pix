const createCertificationCenterMembershipForScoOrganizationMember = async function ({
  membership,
  membershipRepository,
  certificationCenterRepository,
  certificationCenterMembershipRepository,
}) {
  const existingMembership = await membershipRepository.get(membership.id);

  if (!membership.isAdmin || !existingMembership.organization.isScoAndHasExternalId) return;

  const existingCertificationCenter = await certificationCenterRepository.findByExternalId({
    externalId: existingMembership.organization.externalId,
  });

  if (!existingCertificationCenter) return;

  const isAlreadyMemberOfCertificationCenter =
    await certificationCenterMembershipRepository.isMemberOfCertificationCenter({
      userId: existingMembership.user.id,
      certificationCenterId: existingCertificationCenter.id,
    });

  if (!isAlreadyMemberOfCertificationCenter) {
    return await certificationCenterMembershipRepository.save({
      userId: existingMembership.user.id,
      certificationCenterId: existingCertificationCenter.id,
    });
  }
};

export { createCertificationCenterMembershipForScoOrganizationMember };
