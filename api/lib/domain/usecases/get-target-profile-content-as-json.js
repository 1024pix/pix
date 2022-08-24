const { ForbiddenAccess } = require('../../domain/errors');
const dayjs = require('dayjs');

module.exports = async function getTargetProfileContentAsJson({
  userId,
  targetProfileId,
  adminMemberRepository,
  targetProfileForAdminRepository,
}) {
  const adminMember = await adminMemberRepository.get({ userId });
  if (!_hasAuthorizationToDownloadContent(adminMember))
    throw new ForbiddenAccess("L'utilisateur n'est pas autorisé à effectuer cette opération.");
  const targetProfileForAdmin = await targetProfileForAdminRepository.getAsNewFormat({ id: targetProfileId });
  const now = dayjs();
  const fileName = `${now.format('YYYYMMDD')}_profil_cible_${targetProfileForAdmin.name}.json`;
  const jsonContent = targetProfileForAdmin.getContentAsJson();
  return {
    jsonContent,
    fileName,
  };
};

function _hasAuthorizationToDownloadContent(adminMember) {
  return adminMember.isMetier || adminMember.isSupport || adminMember.isSuperAdmin;
}
