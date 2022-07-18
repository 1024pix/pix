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
  isSimplifiedAccess = false,
  createdAt = new Date(),
  ownerOrganizationId,
  description = null,
  comment,
  skills = [],
  tubes = [],
  competences = [],
  areas = [],
  badges = [],
  stages = [],
  imageUrl,
  category = 'OTHER',
  tubesSelection = [],
  tubesSelectionAreas = [],
} = {}) {
  return new TargetProfileWithLearningContent({
    id,
    name,
    outdated,
    isPublic,
    isSimplifiedAccess,
    createdAt,
    ownerOrganizationId,
    description,
    comment,
    skills,
    tubes,
    competences,
    areas,
    badges,
    stages,
    imageUrl,
    category,
    tubesSelection,
    tubesSelectionAreas,
  });
};

buildTargetProfileWithLearningContent.withSimpleLearningContent = function withSimpleLearningContent({
  id = 123,
  name = 'Pour les champions du monde 1998 !! Merci Aimé',
  outdated = false,
  isPublic = false,
  isSimplifiedAccess = false,
  imageUrl,
  createdAt = new Date(),
  ownerOrganizationId,
  description = null,
  comment = null,
  badges = [],
  stages = [],
  category = 'OTHER',
  tubesSelection = [],
  tubesSelectionAreas = [],
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
    isSimplifiedAccess,
    imageUrl,
    createdAt,
    ownerOrganizationId,
    description,
    comment,
    tubesSelection,
    tubesSelectionAreas,
    skills: [skill],
    tubes: [tube],
    competences: [competence],
    areas: [area],
    badges,
    stages,
    category,
  });
};

module.exports = buildTargetProfileWithLearningContent;
