import { injectCodeFromAreaTo } from '../services/inject-code-from-area-to-mission.js';

async function findAllMissions({ missionRepository, areaRepository }) {
  const missions = await missionRepository.findAllMissions();
  return Promise.all(missions.map(async (mission) => await injectCodeFromAreaTo(mission, areaRepository)));
}

export { findAllMissions };
