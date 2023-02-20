export default async function deactivateAdminMember({ id, adminMemberRepository, refreshTokenService }) {
  const { userId } = await adminMemberRepository.getById(id);
  await adminMemberRepository.deactivate({ id });
  await refreshTokenService.revokeRefreshTokensForUserId({ userId });
}
