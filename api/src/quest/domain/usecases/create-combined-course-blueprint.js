import { NotFoundError } from '../../../shared/domain/errors.js';

export const createCombinedCourseBlueprint = async ({
  combinedCourseBlueprintForCreation,
  combinedCourseBlueprintRepository,
  targetProfileRepository,
  cappedTubeRepository,
}) => {
  const existingTargetProfiles = await targetProfileRepository.findByIds({
    ids: combinedCourseBlueprintForCreation.targetProfileIds,
  });

  let existingTargetProfileIds;
  if (existingTargetProfiles.length !== combinedCourseBlueprintForCreation.targetProfileIds.length) {
    existingTargetProfileIds = existingTargetProfiles.map(({ id }) => id);
    const notFoundTargetProfileIds = combinedCourseBlueprintForCreation.targetProfileIds.filter(
      (id) => !existingTargetProfileIds.includes(id),
    );

    throw new NotFoundError(
      `Le(s) profil(s) cible(s) avec le(s) id(s) ${notFoundTargetProfileIds.join(', ')} n'existe(nt) pas`,
    );
  }

  if (combinedCourseBlueprintForCreation.needsCappedTubesFromTargetProfiles) {
    const cappedTubes = await cappedTubeRepository.findCappedTubesForTargetProfileIds({
      targetProfileIds: existingTargetProfileIds,
    });
    combinedCourseBlueprintForCreation.setCappedTubes(cappedTubes);
  }

  return combinedCourseBlueprintRepository.save({
    combinedCourseBlueprint: combinedCourseBlueprintForCreation.toCombinedCourseBlueprint(),
  });
};
