const updateAdminMember = async function ({ id, role, adminMemberRepository }) {
  const attributesToUpdate = { role };
  return await adminMemberRepository.update({ id, attributesToUpdate });
};

export { updateAdminMember };
