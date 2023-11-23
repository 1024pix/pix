import dayjs from 'dayjs';
import { ForbiddenAccess } from '../../../../shared/domain/errors.js';

const getTargetProfileContentAsJson = async function ({
  userId,
  targetProfileId,
  adminMemberRepository,
  targetProfileForAdminRepository,
  learningContentConversionService,
}) {
  const adminMember = await adminMemberRepository.get({ userId });
  if (!_hasAuthorizationToDownloadContent(adminMember))
    throw new ForbiddenAccess("L'utilisateur n'est pas autorisé à effectuer cette opération.");
  const targetProfileForAdmin = await targetProfileForAdminRepository.get({ id: targetProfileId });
  const skills = await learningContentConversionService.findActiveSkillsForCappedTubes(
    targetProfileForAdmin.cappedTubes,
  );
  const jsonContent = targetProfileForAdmin.getContentAsJson(skills);
  const now = dayjs();
  const fileName = `${now.format('YYYYMMDD')}_profil_cible_${targetProfileForAdmin.name}.json`;
  return {
    jsonContent,
    fileName,
  };
};

export { getTargetProfileContentAsJson };

function _hasAuthorizationToDownloadContent(adminMember) {
  return adminMember.isMetier || adminMember.isSupport || adminMember.isSuperAdmin;
}
