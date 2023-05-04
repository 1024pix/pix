import { Badge } from '../../../../lib/domain/models/Badge.js';
import { buildBadgeCriterion } from './build-badge-criterion.js';
import { buildSkillSet } from './build-skill-set.js';

const buildBadge = function ({
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
  complementaryCertificationBadge = null,
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
    complementaryCertificationBadge,
  });
};

export { buildBadge };
