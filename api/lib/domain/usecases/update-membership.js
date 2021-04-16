module.exports = async function updateMembership({ membershipRepository, membershipId, membership }) {

  membership.validateRole();

  return membershipRepository.updateById({ id: membershipId, membership });
};
