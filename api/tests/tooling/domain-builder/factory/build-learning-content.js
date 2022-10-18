const LearningContent = require('../../../../lib/domain/models/LearningContent');
const buildSkill = require('./build-skill');
const buildTube = require('./build-tube');
const buildThematic = require('./build-thematic');
const buildCompetence = require('./build-competence');
const buildArea = require('./build-area');
const buildFramework = require('./build-framework');

function buildLearningContent(areas, frameworks) {
  frameworks = frameworks || [buildFramework({ id: 'frameworkId', name: 'someFramework' })];
  areas = areas || buildArea({ id: 'areaId', frameworkId: frameworks[0].id, framework: frameworks[0] });
  return new LearningContent(areas, frameworks);
}

buildLearningContent.withSimpleContent = () => {
  const framework = buildFramework({ id: 'frameworkId', name: 'someFramework' });
  const skill = buildSkill({ id: 'skillId', tubeId: 'tubeId' });
  const tube = buildTube({ id: 'tubeId', competenceId: 'competenceId', skills: [skill] });
  const area = buildArea({ id: 'areaId', frameworkId: framework.id, framework });
  const competence = buildCompetence({ id: 'competenceId', area, tubes: [tube] });
  const thematic = buildThematic({ id: 'thematicId', competenceId: 'competenceId', tubeIds: ['tubeId'] });
  competence.thematics = [thematic];
  area.competences = [competence];
  framework.areas = [area];
  return buildLearningContent([area], [framework]);
};

module.exports = buildLearningContent;
