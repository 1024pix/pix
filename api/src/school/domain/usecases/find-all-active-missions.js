import * as injectedAreaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as injectedCompetenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
import * as injectedMissionRepository from '../../infrastructure/repositories/mission-repository.js';
import { injectComplementDataTo } from '../services/inject-complement-data-to-mission.js';

async function findAllActiveMissions({
  organizationId,
  missionRepository = injectedMissionRepository,
  areaRepository = injectedAreaRepository,
  competenceRepository = injectedCompetenceRepository,
  organizationLearnerRepository = injectedRepositories.organizationLearnerRepository,
} = {}) {
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
