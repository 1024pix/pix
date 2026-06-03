import { CombinedCourseBlueprint } from '../models/CombinedCourseBlueprint.js';

export const createCombinedCourseBlueprint = async ({
  combinedCourseBlueprintForCreation,
  combinedCourseBlueprintRepository,
  targetProfileRepository,
}) => {
  await targetProfileRepository.findByIds({ ids: combinedCourseBlueprintForCreation.targetProfileIds });

  return combinedCourseBlueprintRepository.save({
    combinedCourseBlueprint: new CombinedCourseBlueprint({ ...combinedCourseBlueprintForCreation }),
  });
};
