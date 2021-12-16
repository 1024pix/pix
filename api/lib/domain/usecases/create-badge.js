const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = async function createBadge({
  targetProfileId,
  badgeCreation,
  badgeRepository,
  badgeCriteriaRepository,
  targetProfileRepository,
}) {
  // eslint-disable-next-line no-unused-vars
  const { campaignThreshold, skillSetThreshold, skillSetName, skillSetSkillsIds, ...badge } = badgeCreation;

  return DomainTransaction.execute(async (domainTransaction) => {
    await targetProfileRepository.get(targetProfileId, domainTransaction);
    await badgeRepository.isKeyAvailable(badge.key, domainTransaction);

    const savedBadge = await badgeRepository.save({ ...badge, targetProfileId }, domainTransaction);

    if (campaignThreshold) {
      await badgeCriteriaRepository.save(
        {
          badgeCriterion: {
            badgeId: savedBadge.id,
            threshold: campaignThreshold,
            scope: 'CampaignParticipation',
          },
        },
        domainTransaction
      );
    }

    // FIXME create criteria and skillSet

    return savedBadge;
  });
};
