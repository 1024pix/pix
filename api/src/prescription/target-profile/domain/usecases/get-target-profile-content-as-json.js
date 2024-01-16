import dayjs from 'dayjs';

const getTargetProfileContentAsJson = async function ({
  targetProfileId,
  targetProfileForAdminRepository,
  learningContentConversionService,
}) {
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
