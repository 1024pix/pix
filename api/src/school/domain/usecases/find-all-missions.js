import { injectComplementDataTo } from '../services/inject-complement-data-to-mission.js';

async function findAllMissions({ missionRepository, areaRepository, competenceRepository }) {
  const missions = await missionRepository.findAllMissions();
  return Promise.all(
    missions.map(async (mission) => await injectComplementDataTo(mission, areaRepository, competenceRepository)),
  );
}

export { findAllMissions };
