module.exports = async function getAdminMembers({ adminMemberRepository }) {
  return adminMemberRepository.findAll();
};
