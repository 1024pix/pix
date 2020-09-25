const TargetedSkill = require('../../../../lib/domain/models/TargetedSkill');

const buildTargetedSkill = function buildTargetedSkill({
  id = 'someSkillId',
  name = 'someSkillName5',
  tubeId = 'someTubeId',
} = {}) {
  return new TargetedSkill({
    id,
    name,
    tubeId,
  });
};

module.exports = buildTargetedSkill;
