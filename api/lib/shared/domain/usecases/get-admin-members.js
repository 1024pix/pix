const getAdminMembers = async function ({ adminMemberRepository }) {
  return adminMemberRepository.findAll();
};

export { getAdminMembers };
