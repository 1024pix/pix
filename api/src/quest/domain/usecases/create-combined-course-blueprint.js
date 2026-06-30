import { NotFoundError } from '../../../shared/domain/errors.js';
import { CombinedCourseBlueprint } from '../models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';

export const createCombinedCourseBlueprint = async ({
  combinedCourseBlueprintForCreation,
  combinedCourseBlueprintRepository,
  targetProfileRepository,
}) => {
  const existingTargetProfiles = await targetProfileRepository.findByIds({
    ids: combinedCourseBlueprintForCreation.targetProfileIds,
  });

  if (existingTargetProfiles.length !== combinedCourseBlueprintForCreation.targetProfileIds.length) {
    const existingTargetProfileIds = existingTargetProfiles.map(({ id }) => id);
    const notFoundTargetProfileIds = combinedCourseBlueprintForCreation.targetProfileIds.filter(
      (id) => !existingTargetProfileIds.includes(id),
    );

    throw new NotFoundError(
      `Le(s) profil(s) cible(s) avec le(s) id(s) ${notFoundTargetProfileIds.join(', ')} n'existe(nt) pas`,
    );
  }

  return combinedCourseBlueprintRepository.save({
    combinedCourseBlueprint: new CombinedCourseBlueprint({ ...combinedCourseBlueprintForCreation }),
  });
};
