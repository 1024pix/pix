module.exports = function findTargetProfileBadges({ targetProfileId, badgeRepository }) {
  return badgeRepository.findByTargetProfileId(targetProfileId);
};
