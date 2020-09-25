const TargetProfileWithLearningContent = require('../../../../lib/domain/models/TargetProfileWithLearningContent');

module.exports = function buildTargetProfileWithLearningContent({
  id = 123,
  name = 'Pour les champions du monde 1998 !! Merci Aimé',
  skills = [],
  tubes = [],
  competences = [],
  areas = [],
} = {}) {
  return new TargetProfileWithLearningContent({
    id,
    name,
    skills,
    tubes,
    competences,
    areas,
  });
};
