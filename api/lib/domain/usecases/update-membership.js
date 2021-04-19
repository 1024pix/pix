async function createCertificationCenterMembership(certificationCenterMembershipRepository, existingMembership, existingCertificationCenter) {
  const isAlreadyMemberOfCertificationCenter = await certificationCenterMembershipRepository.isMemberOfCertificationCenter(existingMembership.user.id, existingCertificationCenter.id);

  if (!isAlreadyMemberOfCertificationCenter) {
    certificationCenterMembershipRepository.save(existingMembership.user.id, existingCertificationCenter.id);
  }
}

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
    const existingCertificationCenter = await certificationCenterRepository.findByExternalId({ externalId: existingMembership.organization.externalId });

    if (existingCertificationCenter) {
      await createCertificationCenterMembership(certificationCenterMembershipRepository, existingMembership, existingCertificationCenter);
    }
  }

  return membershipRepository.updateById({ id: membershipId, membership });
};
