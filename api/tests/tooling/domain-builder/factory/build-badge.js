import Badge from '../../../../lib/domain/models/Badge';
import buildBadgeCriterion from './build-badge-criterion';
import buildSkillSet from './build-skill-set';

export default function buildBadge({
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
}
