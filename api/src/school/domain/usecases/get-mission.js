import { injectComplementDataTo } from '../services/inject-complement-data-to-mission.js';

const getMission = async function ({ missionId, missionRepository, areaRepository, competenceRepository }) {
  const mission = await missionRepository.get(missionId);
  return await injectComplementDataTo(mission, areaRepository, competenceRepository);
};

export { getMission };
