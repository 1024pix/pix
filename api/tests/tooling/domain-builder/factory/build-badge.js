const Badge = require('../../../../lib/domain/models/Badge');
const buildBadgeCriterion = require('./build-badge-criterion');
const buildBadgePartnerCompetence = require('./build-badge-partner-competence');

module.exports = function buildBadge({
  id = 1,
  altMessage = 'altMessage',
  imageUrl = '/img/banana',
  message = 'message',
  title = 'title',
  key = 'key',
  targetProfileId = 456,
  badgeCriteria = [
    buildBadgeCriterion(),
  ],
  badgePartnerCompetences = [
    buildBadgePartnerCompetence(),
    buildBadgePartnerCompetence(),
  ],
} = {}) {
  return new Badge({
    id,
    altMessage,
    imageUrl,
    message,
    title,
    key,
    targetProfileId,
    badgeCriteria,
    badgePartnerCompetences,
  });
};
