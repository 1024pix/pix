import { FRENCH_FRANCE, FRENCH_SPOKEN } from '../../../../shared/domain/services/locale-service.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../../../../shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../../../shared/infrastructure/repositories/tube-repository.js';

async function getFrameworkReferential({ challengeIds }) {
  const challenges = await challengeRepository.getMany_proxy(challengeIds, FRENCH_FRANCE);

  const skillIds = challenges.map((challenge) => challenge.skillId);
  const uniqSkillIds = [...new Set(skillIds)];
  const skills = await skillRepository.findByRecordIds(uniqSkillIds);

  const tubeIds = skills.map((skill) => skill.tubeId);
  const uniqTubeIds = [...new Set(tubeIds)];
  const tubes = await tubeRepository.findByRecordIds(uniqTubeIds, FRENCH_SPOKEN);
  tubes.forEach((tube) => {
    tube.skills = skills.filter((skill) => {
      return skill.tubeId === tube.id;
    });
  });

  const thematicIds = tubes.map((tube) => tube.thematicId);
  const thematics = await thematicRepository.findByRecordIds(thematicIds, FRENCH_SPOKEN);
  thematics.forEach((thematic) => {
    thematic.tubes = tubes.filter((tube) => tube.thematicId === thematic.id);
  });

  const competenceIds = tubes.map((tube) => tube.competenceId);
  const competences = await competenceRepository.findByRecordIds({
    competenceIds,
    locale: FRENCH_SPOKEN,
  });
  competences.forEach((competence) => {
    competence.tubes = tubes.filter((tube) => {
      return tube.competenceId === competence.id;
    });
    competence.thematics = thematics.filter((thematic) => {
      return thematic.competenceId === competence.id;
    });
  });

  const allAreaIds = competences.map((competence) => competence.areaId);
  const uniqAreaIds = [...new Set(allAreaIds)];
  const areas = await areaRepository.findByRecordIds({
    areaIds: uniqAreaIds,
    locale: FRENCH_SPOKEN,
  });
  areas.forEach((area) => {
    area.competences = competences.filter((competence) => {
      return competence.areaId === area.id;
    });
  });

  return areas;
}

export { getFrameworkReferential };
