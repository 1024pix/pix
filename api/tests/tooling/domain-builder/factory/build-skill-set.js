const SkillSet = require('../../../../lib/domain/models/SkillSet');

module.exports = function buildSkillSet({ id = 1, badgeId = 64, name = 'name', skillIds = ['recABC', 'recDEF'] } = {}) {
  return new SkillSet({
    id,
    badgeId,
    name,
    skillIds,
  });
};
