/**
 * @param {Object} params
 * @param {import('./index.js').CombinedCourseBlueprintRepository} params.combinedCourseBlueprintRepository
 * @returns {Promise<import('../models/combined-course-blueprints/entities/CombinedCourseBlueprint.js').CombinedCourseBlueprint[]>}
 **/
export const findCombinedCourseBlueprints = async ({ combinedCourseBlueprintRepository }) => {
  return combinedCourseBlueprintRepository.findAll();
};
