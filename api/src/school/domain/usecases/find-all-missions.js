import { injectComplementDataTo } from '../services/inject-complement-data-to-mission.js';

async function findAllMissions({
  organizationId,
  missionRepository,
  areaRepository,
  competenceRepository,
  organizationLearnerRepository,
}) {
  const missions = await missionRepository.findAllMissions();
  return Promise.all(
    missions.map(async (mission) => {
      return await injectComplementDataTo({
        mission,
        organizationId,
        areaRepository,
        competenceRepository,
        organizationLearnerRepository,
      });
    }),
  );
}

export { findAllMissions };
