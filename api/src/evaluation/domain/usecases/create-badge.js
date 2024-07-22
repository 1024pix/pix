import { withTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { MissingBadgeCriterionError } from '../../../shared/domain/errors.js';

const createBadge = withTransaction(async function ({
  targetProfileId,
  badgeCreation,
  badgeRepository,
  badgeCriteriaRepository,
  targetProfileRepository,
}) {
  const { campaignThreshold, cappedTubesCriteria, ...badge } = badgeCreation;
  await targetProfileRepository.get(targetProfileId);

  const isCampaignThresholdValid = campaignThreshold || campaignThreshold === 0;
  const hasCappedTubesCriteria = cappedTubesCriteria?.length > 0;

  if (!isCampaignThresholdValid && !hasCappedTubesCriteria) {
    throw new MissingBadgeCriterionError();
  }

  const savedBadge = await badgeRepository.save({ ...badge, targetProfileId });

  if (isCampaignThresholdValid) {
    await badgeCriteriaRepository.save({
      badgeCriterion: {
        badgeId: savedBadge.id,
        threshold: campaignThreshold,
        scope: 'CampaignParticipation',
      },
    });
  }

  if (hasCappedTubesCriteria) {
    const allCappedTubes = cappedTubesCriteria.flatMap(({ cappedTubes }) => cappedTubes);

    await targetProfileRepository.hasTubesWithLevels({ targetProfileId, tubesWithLevels: allCappedTubes });

    for (const criterion of cappedTubesCriteria) {
      await badgeCriteriaRepository.save({
        badgeCriterion: {
          badgeId: savedBadge.id,
          name: criterion.name,
          threshold: criterion.threshold,
          scope: 'CappedTubes',
          cappedTubes: criterion.cappedTubes,
        },
      });
    }
  }
  return savedBadge;
});

export { createBadge };
