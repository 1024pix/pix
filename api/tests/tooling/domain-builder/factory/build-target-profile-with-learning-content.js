const TargetProfileWithLearningContent = require('../../../../lib/domain/models/TargetProfileWithLearningContent');
const buildTargetedSkill = require('./build-targeted-skill');
const buildTargetedTube = require('./build-targeted-tube');
const buildTargetedCompetence = require('./build-targeted-competence');
const buildTargetedArea = require('./build-targeted-area');

const buildTargetProfileWithLearningContent = function buildTargetProfileWithLearningContent({
  id = 123,
  name = 'Pour les champions du monde 1998 !! Merci Aimé',
  outdated = false,
  isPublic = false,
  organizationId,
  skills = [],
  tubes = [],
  competences = [],
  areas = [],
  badges = [],
  stages = [],
} = {}) {
  return new TargetProfileWithLearningContent({
    id,
    name,
    outdated,
    isPublic,
    organizationId,
    skills,
    tubes,
    competences,
    areas,
    badges,
    stages,
  });
};

buildTargetProfileWithLearningContent.withSimpleLearningContent = function withSimpleLearningContent({
  id = 123,
  name = 'Pour les champions du monde 1998 !! Merci Aimé',
  outdated = false,
  isPublic = false,
  organizationId,
  badges = [],
  stages = [],
} = {}) {
  const skill = buildTargetedSkill({ id: 'skillId', tubeId: 'tubeId' });
  const tube = buildTargetedTube({ id: 'tubeId', competenceId: 'competenceId', skills: [skill] });
  const competence = buildTargetedCompetence({ id: 'competenceId', areaId: 'areaId', tubes: [tube] });
  const area = buildTargetedArea({ id: 'areaId', competences: [competence] });
  return new TargetProfileWithLearningContent({
    id,
    name,
    outdated,
    isPublic,
    organizationId,
    skills: [skill],
    tubes: [tube],
    competences: [competence],
    areas: [area],
    badges,
    stages,
  });
};

module.exports = buildTargetProfileWithLearningContent;
