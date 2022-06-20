module.exports = async function deactivateAdminMember({ id, adminMemberRepository }) {
  await adminMemberRepository.deactivate({ id });
};
