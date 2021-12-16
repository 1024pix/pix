module.exports = async function createBadge({
  targetProfileId,
  badgeCreation,
  badgeRepository,
  badgeCriteriaRepository,
  targetProfileRepository,
}) {
  // eslint-disable-next-line no-unused-vars
  const { campaignThreshold, skillSetThreshold, skillSetName, skillSetSkillsIds, ...badge } = badgeCreation;

  await targetProfileRepository.get(targetProfileId);
  await badgeRepository.isKeyAvailable(badge.key);

  const savedBadge = await badgeRepository.save({ ...badge, targetProfileId });

  if (campaignThreshold) {
    await badgeCriteriaRepository.save({
      badgeCriterion: {
        badgeId: savedBadge.id,
        threshold: campaignThreshold,
        scope: 'CampaignParticipation',
      },
    });
  }

  // FIXME create criteria and skillSet

  return savedBadge;
};
