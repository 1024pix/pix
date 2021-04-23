const OrganizationTypes = require('../models/Organization').types;
const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = async function updateMembership({
  membershipId,
  membership,
  membershipRepository,
  certificationCenterRepository,
  certificationCenterMembershipRepository,
}) {

  membership.validateRole();
  const existingMembership = await membershipRepository.get(membershipId);

  if (existingMembership.organization.type === OrganizationTypes.SCO && membership.isAdmin) {

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
