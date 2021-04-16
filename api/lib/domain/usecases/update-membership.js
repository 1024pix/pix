module.exports = async function updateMembership({ membershipRepository, membershipId, membership }) {
  return membershipRepository.updateById({ id: membershipId, membership });
};
