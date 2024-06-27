const updateBadge = async function ({ badgeId, badge: badgeDataToUpdate, badgeRepository }) {
  const badgeToUpdate = await badgeRepository.get(badgeId);
  badgeToUpdate.updateBadgeProperties(badgeDataToUpdate);
  return badgeRepository.update(badgeToUpdate);
};

export { updateBadge };
