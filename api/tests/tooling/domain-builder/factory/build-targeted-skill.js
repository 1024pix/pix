const TargetedSkill = require('../../../../lib/domain/models/TargetedSkill');

const buildTargetedSkill = function buildTargetedSkill({
  id = 'someSkillId',
  name = 'someSkillName5',
  tubeId = 'someTubeId',
  tutorialIds = [],
} = {}) {
  return new TargetedSkill({
    id,
    name,
    tubeId,
    tutorialIds,
  });
};

module.exports = buildTargetedSkill;
