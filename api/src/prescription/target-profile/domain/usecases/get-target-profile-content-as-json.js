const getTargetProfileContentAsJson = async function ({
  targetProfileId,
  targetProfileAdministrationRepository,
  learningContentConversionService,
}) {
  const targetProfileForAdmin = await targetProfileAdministrationRepository.get({ id: targetProfileId });
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
