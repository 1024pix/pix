const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = async function createBadge({
  targetProfileId,
  badgeCreation,
  badgeRepository,
  badgeCriteriaRepository,
  targetProfileRepository,
  skillSetRepository,
}) {
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

    if (skillSetThreshold) {
      const { id: skillSetId } = await skillSetRepository.save(
        {
          skillSet: {
            badgeId: savedBadge.id,
            name: skillSetName,
            skillIds: skillSetSkillsIds,
          },
        },
        domainTransaction
      );

      await badgeCriteriaRepository.save(
        {
          badgeCriterion: {
            badgeId: savedBadge.id,
            threshold: skillSetThreshold,
            scope: 'SkillSet',
            skillSetIds: [skillSetId],
          },
        },
        domainTransaction
      );
    }

    return savedBadge;
  });
};
