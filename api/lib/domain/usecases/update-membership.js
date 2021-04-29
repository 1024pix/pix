const OrganizationTypes = require('../models/Organization').types;
const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = async function updateMembership({
  membership,
  membershipRepository,
  certificationCenterRepository,
  certificationCenterMembershipRepository,
}) {
  membership.validateRole();
  const existingMembership = await membershipRepository.get(membership.id);
  if (existingMembership.organization.type === OrganizationTypes.SCO && membership.isAdmin) {

    const existingCertificationCenter = await certificationCenterRepository.findByExternalId({ externalId: existingMembership.organization.externalId });

    if (existingCertificationCenter) {
      const isAlreadyMemberOfCertificationCenter = await certificationCenterMembershipRepository.isMemberOfCertificationCenter(existingMembership.user.id, existingCertificationCenter.id);

      if (!isAlreadyMemberOfCertificationCenter) {
        return DomainTransaction.execute(async (domainTransaction) => {
          await certificationCenterMembershipRepository
            .save(existingMembership.user.id, existingCertificationCenter.id, domainTransaction);
          return membershipRepository.updateById({ id: existingMembership.id, membership }, domainTransaction);
        });
      }
    }
  }

  return membershipRepository.updateById({ id: existingMembership.id, membership });
};
