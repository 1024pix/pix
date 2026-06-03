import { NotFoundError } from '../../../shared/domain/errors.js';

export const updateCombinedCourseBlueprint = async ({
  combinedCourseBlueprintId,
  combinedCourseBlueprintForUpdate,
  combinedCourseBlueprintRepository,
}) => {
  const combinedCourseBlueprint = await combinedCourseBlueprintRepository.findById({ id: combinedCourseBlueprintId });
  if (!combinedCourseBlueprint) {
    throw new NotFoundError();
  }

  return combinedCourseBlueprintRepository.save({
    combinedCourseBlueprint: combinedCourseBlueprint.update({ combinedCourseBlueprintForUpdate }),
  });
};
