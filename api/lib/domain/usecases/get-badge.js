module.exports = function getBadge({
  badgeId,
  badgeRepository,
}) {
  return badgeRepository.get(badgeId);
};
