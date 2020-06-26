
module.exports = async function updateMembership({ membershipRepository, membershipId, membershipAttributes }) {
  return membershipRepository.updateById({ id: membershipId, membershipAttributes });
};
