export const findCombinedCourseBlueprintById = async ({
  id,
  combinedCourseBlueprintRepository,
  targetProfileRepository,
  moduleRepository,
  recommendedModuleRepository,
}) => {
  const combinedCourseBlueprint = await combinedCourseBlueprintRepository.findById({ id });
  const targetProfiles = await targetProfileRepository.findByIds({
    ids: combinedCourseBlueprint.targetProfileIds,
  });
  const recommendableModules = await recommendedModuleRepository.findIdsByTargetProfileIds({
    targetProfileIds: combinedCourseBlueprint.targetProfileIds,
  });
  const modules = await moduleRepository.getByIds({
    moduleIds: combinedCourseBlueprint.moduleIds,
  });

  combinedCourseBlueprint.generateItems({
    targetProfiles,
    modules,
    recommendableModules,
  });
  return combinedCourseBlueprint;
};
