import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';const getAutonomousCourseTargetProfiles = async function(
  { autonomousCourseTargetProfileRepository = injectedRepositories.autonomousCourseTargetProfileRepository } = {},
) {
  return await autonomousCourseTargetProfileRepository.get();
};

export { getAutonomousCourseTargetProfiles };
