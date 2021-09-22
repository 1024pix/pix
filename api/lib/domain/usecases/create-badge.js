module.exports = async function createBadge({ targetProfileId, badge, badgeRepository, targetProfileRepository }) {
  await targetProfileRepository.get(targetProfileId);
  await badgeRepository.isKeyAvailable(badge.key);

  return badgeRepository.save(badge);
};
