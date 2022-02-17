const DomainTransaction = require('../../infrastructure/DomainTransaction');
const { MissingBadgeCriterionError } = require('../errors');

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

    const isCampaignThresholdValid = campaignThreshold || campaignThreshold === 0;

    if (!isCampaignThresholdValid && !skillSetThreshold) {
      throw new MissingBadgeCriterionError();
    }

    const savedBadge = await badgeRepository.save({ ...badge, targetProfileId }, domainTransaction);

    if (isCampaignThresholdValid) {
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
      await targetProfileRepository.hasSkills({ targetProfileId, skillIds: skillSetSkillsIds }, domainTransaction);

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
