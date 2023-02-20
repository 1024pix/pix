import DomainTransaction from '../../infrastructure/DomainTransaction';
import { MissingBadgeCriterionError } from '../errors';

export default async function createBadge({
  targetProfileId,
  badgeCreation,
  badgeRepository,
  badgeCriteriaRepository,
  targetProfileRepository,
  skillSetRepository,
}) {
  const { campaignThreshold, skillSetThreshold, cappedTubesCriteria, skillSetName, skillSetSkillsIds, ...badge } =
    badgeCreation;

  return DomainTransaction.execute(async (domainTransaction) => {
    await targetProfileRepository.get(targetProfileId, domainTransaction);
    await badgeRepository.isKeyAvailable(badge.key, domainTransaction);

    const isCampaignThresholdValid = campaignThreshold || campaignThreshold === 0;
    const hasCappedTubesCriteria = cappedTubesCriteria?.length > 0;

    if (!isCampaignThresholdValid && !skillSetThreshold && !hasCappedTubesCriteria) {
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

    if (hasCappedTubesCriteria) {
      const allCappedTubes = cappedTubesCriteria.flatMap(({ cappedTubes }) => cappedTubes);

      await targetProfileRepository.hasTubesWithLevels(
        { targetProfileId, tubesWithLevels: allCappedTubes },
        domainTransaction
      );

      for (const criterion of cappedTubesCriteria) {
        await badgeCriteriaRepository.save(
          {
            badgeCriterion: {
              badgeId: savedBadge.id,
              name: criterion.name,
              threshold: criterion.threshold,
              scope: 'CappedTubes',
              cappedTubes: criterion.cappedTubes,
            },
          },
          domainTransaction
        );
      }
    }
    return savedBadge;
  });
}
