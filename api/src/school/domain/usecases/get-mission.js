import * as injectedAreaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as injectedCompetenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as injectedMissionRepository from '../../infrastructure/repositories/mission-repository.js';
import { injectComplementDataTo } from '../services/inject-complement-data-to-mission.js';

const getMission = async function ({
  missionId,
  organizationId,
  missionRepository = injectedMissionRepository,
  areaRepository = injectedAreaRepository,
  competenceRepository = injectedCompetenceRepository,
  organizationLearnerRepository,
} = {}) {
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
