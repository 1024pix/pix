import { injectComplementDataTo } from '../services/inject-complement-data-to-mission.js';

async function findAllActiveMissions({
  organizationId,
  missionRepository,
  areaRepository,
  competenceRepository,
  organizationLearnerRepository,
}) {
  const missions = await missionRepository.findAllActiveMissions();
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

export { findAllActiveMissions };
