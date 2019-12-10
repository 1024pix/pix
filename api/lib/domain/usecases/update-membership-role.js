
module.exports = async function updateMembershipRole({ membershipRepository, membershipId, organizationRole }) {
  const membershipUpdated = await membershipRepository.updateRoleById({ id: membershipId, organizationRole });
  return membershipUpdated;
};
