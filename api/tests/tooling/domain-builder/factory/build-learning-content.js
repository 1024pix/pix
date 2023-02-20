import LearningContent from '../../../../lib/domain/models/LearningContent';
import buildSkill from './build-skill';
import buildTube from './build-tube';
import buildThematic from './build-thematic';
import buildCompetence from './build-competence';
import buildArea from './build-area';
import buildFramework from './build-framework';

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

export default buildLearningContent;
