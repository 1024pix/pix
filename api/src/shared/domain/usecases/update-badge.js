const updateBadge = async function ({ badgeId, badge, badgeRepository }) {
  const existingBadge = await badgeRepository.get(badgeId);

  if (badge.message) existingBadge.message = badge.message;
  if (badge.altMessage) existingBadge.altMessage = badge.altMessage;
  if (badge.key) existingBadge.key = badge.key;
  if (badge.title) existingBadge.title = badge.title;
  if (typeof badge.isCertifiable === 'boolean') existingBadge.isCertifiable = badge.isCertifiable;
  if (typeof badge.isAlwaysVisible === 'boolean') existingBadge.isAlwaysVisible = badge.isAlwaysVisible;
  if (badge.imageUrl) existingBadge.imageUrl = badge.imageUrl;

  return badgeRepository.update(existingBadge);
};

export { updateBadge };
