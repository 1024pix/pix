import { LearningContent } from '../../../../lib/domain/models/LearningContent.js';
import { buildSkill } from './build-skill.js';
import { buildTube } from './build-tube.js';
import { buildThematic } from './build-thematic.js';
import { buildCompetence } from './build-competence.js';
import { buildArea } from './build-area.js';
import { buildFramework } from './build-framework.js';

function buildLearningContent(frameworks) {
  frameworks = frameworks || [buildFramework({ id: 'frameworkId', name: 'someFramework' })];
  return new LearningContent(frameworks);
}

buildLearningContent.withSimpleContent = () => {
  const framework = buildFramework({ id: 'frameworkId', name: 'someFramework' });
  const skill = buildSkill({ id: 'skillId', tubeId: 'tubeId' });
  const tube = buildTube({ id: 'tubeId', competenceId: 'competenceId', skills: [skill] });
  const area = buildArea({ id: 'areaId', frameworkId: framework.id });
  const competence = buildCompetence({ id: 'competenceId', area, tubes: [tube] });
  const thematic = buildThematic({ id: 'thematicId', competenceId: 'competenceId', tubeIds: ['tubeId'] });
  competence.thematics = [thematic];
  area.competences = [competence];
  framework.areas = [area];
  return buildLearningContent([framework]);
};

export { buildLearningContent };
