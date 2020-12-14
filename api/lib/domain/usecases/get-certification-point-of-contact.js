const { NotFoundError } = require('../errors');

module.exports = async function getCertificationPointOfContact({
  userId,
  certificationCenterMembershipRepository,
  certificationPointOfContactRepository,
}) {
  const isCertificationCenterMember = await certificationCenterMembershipRepository.doesUserHaveMembershipToAnyCertificationCenter(userId);
  if (!isCertificationCenterMember) {
    throw new NotFoundError(`Le référent de certification d'id ${userId} n’existe pas.`);
  }

  return certificationPointOfContactRepository.get(userId);
};
