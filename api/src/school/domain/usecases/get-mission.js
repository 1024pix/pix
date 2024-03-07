import { injectComplementDataTo } from '../services/inject-complement-data-to-mission.js';

const getMission = async function ({
  missionId,
  organizationId,
  missionRepository,
  areaRepository,
  competenceRepository,
  organizationLearnerRepository,
}) {
  const mission = await missionRepository.get(missionId);
  return await injectComplementDataTo({
    mission,
    organizationId,
    areaRepository,
    competenceRepository,
    organizationLearnerRepository,
  });
};

export { getMission };
