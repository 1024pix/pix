module.exports = async function createBadge({
  targetProfileId,
  badgeCreation,
  badgeRepository,
  targetProfileRepository,
}) {
  // eslint-disable-next-line no-unused-vars
  const { campaignThreshold, skillSetThreshold, skillSetName, skillSetSkillsIds, ...badge } = badgeCreation;

  await targetProfileRepository.get(targetProfileId);
  await badgeRepository.isKeyAvailable(badge.key);

  // FIXME create criteria and skillSet

  return badgeRepository.save({ ...badge, targetProfileId });
};
