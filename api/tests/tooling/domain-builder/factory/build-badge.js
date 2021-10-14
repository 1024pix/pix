const Badge = require('../../../../lib/domain/models/Badge');
const buildBadgeCriterion = require('./build-badge-criterion');
const buildSkillSet = require('./build-skill-set');

module.exports = function buildBadge({
  id = 1,
  altMessage = 'altMessage',
  imageUrl = '/img/banana',
  message = 'message',
  title = 'title',
  key = 'key',
  isCertifiable = false,
  targetProfileId = 456,
  badgeCriteria = [buildBadgeCriterion(), buildBadgeCriterion({ id: 2, skillSetIds: [1, 2] })],
  skillSets = [buildSkillSet(), buildSkillSet({ id: 2 })],
  isAlwaysVisible = false,
} = {}) {
  return new Badge({
    id,
    altMessage,
    imageUrl,
    message,
    title,
    key,
    isCertifiable,
    targetProfileId,
    badgeCriteria,
    skillSets,
    isAlwaysVisible,
  });
};
