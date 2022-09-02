const TargetedSkill = require('../../../../lib/domain/models/TargetedSkill');

const buildTargetedSkill = function buildTargetedSkill({
  id = 'someSkillId',
  name = 'someSkillName5',
  tubeId = 'someTubeId',
  tutorialIds = [],
  difficulty = 5,
} = {}) {
  return new TargetedSkill({
    id,
    name,
    tubeId,
    tutorialIds,
    difficulty,
  });
};

module.exports = buildTargetedSkill;
