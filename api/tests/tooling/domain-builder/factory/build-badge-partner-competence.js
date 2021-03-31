const BadgePartnerCompetence = require('../../../../lib/domain/models/BadgePartnerCompetence');

module.exports = function buildBadgePartnerCompetence({
  id = 1,
  name = 'name',
  color = null,
  skillIds = [
    'recABC',
    'recDEF',
  ],
} = {}) {
  return new BadgePartnerCompetence({
    id,
    name,
    color,
    skillIds,
  });
};
