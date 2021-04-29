const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = async function updateMembership({
  membership,
  membershipRepository,
  certificationCenterRepository,
  certificationCenterMembershipRepository,
}) {
  membership.validateRole();
  const existingMembership = await membershipRepository.get(membership.id);

  if (membership.isAdmin && existingMembership.organization.isSco) {

    const existingCertificationCenter = await certificationCenterRepository.findByExternalId({ externalId: existingMembership.organization.externalId });

    if (existingCertificationCenter) {
      const isAlreadyMemberOfCertificationCenter = await certificationCenterMembershipRepository.isMemberOfCertificationCenter(existingMembership.user.id, existingCertificationCenter.id);

      if (!isAlreadyMemberOfCertificationCenter) {
        return createCertificationCenterMembershipAndUpdateMembership({
          userId: existingMembership.user.id,
          certificationCenterId: existingCertificationCenter.id,
          membership,
          certificationCenterMembershipRepository,
          membershipRepository,
        });
      }
    }
  }

  return membershipRepository.updateById({ id: existingMembership.id, membership });
};

function createCertificationCenterMembershipAndUpdateMembership({
  userId,
  certificationCenterId,
  membership,
  certificationCenterMembershipRepository,
  membershipRepository,
}) {
  return DomainTransaction.execute(async (domainTransaction) => {
    await certificationCenterMembershipRepository
      .save(userId, certificationCenterId, domainTransaction);
    return membershipRepository.updateById({ id: membership.id, membership }, domainTransaction);
  });
}
