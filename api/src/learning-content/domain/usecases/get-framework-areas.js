import { AreaForAdmin } from '../../../shared/domain/models/LearningContentForAdmin.js';
import * as injectedSharedAreaRepository from '../../../shared/infrastructure/repositories/area-repository.js';
import * as injectedSharedFrameworkRepository from '../../../shared/infrastructure/repositories/framework-repository.js';
import * as injectedSharedSkillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import * as injectedSharedThematicRepository from '../../../shared/infrastructure/repositories/thematic-repository.js';
import * as injectedSharedTubeRepository from '../../../shared/infrastructure/repositories/tube-repository.js';

const getFrameworkAreas = async function ({
  frameworkId,
  frameworkName,
  locale,
  sharedAreaRepository = injectedSharedAreaRepository,
  sharedFrameworkRepository = injectedSharedFrameworkRepository,
  sharedSkillRepository = injectedSharedSkillRepository,
  sharedThematicRepository = injectedSharedThematicRepository,
  sharedTubeRepository = injectedSharedTubeRepository,
} = {}) {
  try {
    if (!frameworkId) {
      const framework = await sharedFrameworkRepository.getByName(frameworkName);
      frameworkId = framework.id;
    }

    const areasWithCompetences = await sharedAreaRepository.findByFrameworkIdWithCompetences({ frameworkId, locale });

    const competences = areasWithCompetences.flatMap((area) => area.competences);

    const competenceIds = competences.map(({ id: competenceId }) => competenceId);
    const thematics = await sharedThematicRepository.findByCompetenceIds(competenceIds, locale);

    const tubeIds = thematics.flatMap((thematic) => thematic.tubeIds);
    const tubes = await sharedTubeRepository.findActiveByRecordIds(tubeIds, locale);

    const skillIds = tubes.flatMap((tube) => tube.skillIds);
    const skills = await sharedSkillRepository.findActiveByRecordIds(skillIds);

    return areasWithCompetences.map(
      (areaWithCompetences) =>
        new AreaForAdmin({
          id: areaWithCompetences.id,
          frameworkId: areaWithCompetences.frameworkId,
          title: areaWithCompetences.title,
          code: areaWithCompetences.code,
          color: areaWithCompetences.color,
          allCompetences: areaWithCompetences.competences,
          allThematics: thematics,
          allTubes: tubes,
          allSkills: skills,
        }),
    );
  } catch (e) {
    console.error(e);
  }
};

export { getFrameworkAreas };
