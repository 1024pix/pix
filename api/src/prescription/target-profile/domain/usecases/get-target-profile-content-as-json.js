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

  return {
    jsonContent,
    targetProfileName: targetProfileForAdmin.name,
  };
};

export { getTargetProfileContentAsJson };
