module.exports = async function getAdminMemberDetails({ adminMemberRepository, userId }) {
  return await adminMemberRepository.get({ userId });
};
