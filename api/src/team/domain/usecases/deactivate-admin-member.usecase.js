const deactivateAdminMember = async function ({ id, adminMemberRepository, refreshTokenRepository }) {
  const { userId } = await adminMemberRepository.getById(id);
  await adminMemberRepository.deactivate({ id });
  await refreshTokenRepository.revokeAllByUserId({ userId });
};

export { deactivateAdminMember };
