import { injectCodeFromAreaTo } from '../services/inject-code-from-area-to-mission.js';

const getMission = async function ({ missionId, missionRepository, areaRepository }) {
  const mission = await missionRepository.get(missionId);
  return await injectCodeFromAreaTo(mission, areaRepository);
};

export { getMission };
