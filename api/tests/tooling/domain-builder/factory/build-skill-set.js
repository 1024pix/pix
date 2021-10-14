const SkillSet = require('../../../../lib/domain/models/SkillSet');

module.exports = function buildBadgePartnerCompetence({ id = 1, name = 'name', skillIds = ['recABC', 'recDEF'] } = {}) {
  return new SkillSet({
    id,
    name,
    skillIds,
  });
};
