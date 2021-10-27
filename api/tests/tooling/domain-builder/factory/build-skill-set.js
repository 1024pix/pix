const SkillSet = require('../../../../lib/domain/models/SkillSet');

module.exports = function buildSkillSet({ id = 1, name = 'name', skillIds = ['recABC', 'recDEF'] } = {}) {
  return new SkillSet({
    id,
    name,
    skillIds,
  });
};
