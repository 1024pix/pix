module.exports = async function createCertificationCenterMembershipForScoOrganization({
  membership,
  membershipRepository,
  certificationCenterRepository,
  certificationCenterMembershipRepository,
}) {
  const existingMembership = await membershipRepository.get(membership.id);

  if (membership.isAdmin && existingMembership.organization.isScoAndHasExternalId) {
    const existingCertificationCenter = await certificationCenterRepository.findByExternalId({
      externalId: existingMembership.organization.externalId,
    });

    if (existingCertificationCenter) {
      const isAlreadyMemberOfCertificationCenter =
        await certificationCenterMembershipRepository.isMemberOfCertificationCenter(
          existingMembership.user.id,
          existingCertificationCenter.id
        );

      if (!isAlreadyMemberOfCertificationCenter) {
        return await certificationCenterMembershipRepository.save({
          userId: existingMembership.user.id,
          certificationCenterId: existingCertificationCenter.id,
        });
      }
    }
  }
};
