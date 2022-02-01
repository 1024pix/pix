const BadgeWithLearningContent = require('../../../../lib/domain/models/BadgeWithLearningContent');
const buildBadge = require('./build-badge');
const buildSkill = require('./build-skill');
const buildTube = require('./build-tube');

module.exports = function buildBadgeWithLearningContent({
  badge = buildBadge(),
  skills = [buildSkill()],
  tubes = [buildTube()],
} = {}) {
  return new BadgeWithLearningContent({ badge, skills, tubes });
};
