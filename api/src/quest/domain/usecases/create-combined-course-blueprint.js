import { CombinedCourseBlueprint } from '../models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';

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
