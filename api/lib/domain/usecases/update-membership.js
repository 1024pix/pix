const DomainTransaction = require('../../infrastructure/DomainTransaction');

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
      const isAlreadyMemberOfCertificationCenter = await certificationCenterMembershipRepository.isMemberOfCertificationCenter(existingMembership.user.id, existingCertificationCenter.id);

      if (!isAlreadyMemberOfCertificationCenter) {
        return DomainTransaction.execute(async (domainTransaction) => {
          await certificationCenterMembershipRepository.save(existingMembership.user.id, existingCertificationCenter.id, domainTransaction);
          return membershipRepository.updateById({ id: membershipId, membership }, domainTransaction);
        });
      }
    }
  }

  return membershipRepository.updateById({ id: membershipId, membership });
};
