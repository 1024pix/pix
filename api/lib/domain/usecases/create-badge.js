import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import { MissingBadgeCriterionError } from '../../../src/shared/domain/errors.js';

const createBadge = async function ({
  targetProfileId,
  badgeCreation,
  badgeRepository,
  badgeCriteriaRepository,
  targetProfileRepository,
}) {
  const { campaignThreshold, cappedTubesCriteria, ...badge } = badgeCreation;
  return DomainTransaction.execute(async (domainTransaction) => {
    await targetProfileRepository.get(targetProfileId, domainTransaction);
    await badgeRepository.isKeyAvailable(badge.key, domainTransaction);

    const isCampaignThresholdValid = campaignThreshold || campaignThreshold === 0;
    const hasCappedTubesCriteria = cappedTubesCriteria?.length > 0;

    if (!isCampaignThresholdValid && !hasCappedTubesCriteria) {
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
        domainTransaction,
      );
    }

    if (hasCappedTubesCriteria) {
      const allCappedTubes = cappedTubesCriteria.flatMap(({ cappedTubes }) => cappedTubes);

      await targetProfileRepository.hasTubesWithLevels(
        { targetProfileId, tubesWithLevels: allCappedTubes },
        domainTransaction,
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
          domainTransaction,
        );
      }
    }
    return savedBadge;
  });
};

export { createBadge };
