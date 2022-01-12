module.exports = async function updateBadge({ badgeId, badge, badgeRepository }) {
  const existingBadge = await badgeRepository.get(badgeId);

  if (badge.message) existingBadge.message = badge.message;
  if (badge.altMessage) existingBadge.altMessage = badge.altMessage;
  if (badge.key) existingBadge.key = badge.key;
  if (badge.title) existingBadge.title = badge.title;

  return badgeRepository.update(existingBadge);
};
