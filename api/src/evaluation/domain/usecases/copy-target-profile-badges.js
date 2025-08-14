import * as injectedBadgeCriteriaRepository from '../../infrastructure/repositories/badge-criteria-repository.js';
import * as injectedBadgeRepository from '../../infrastructure/repositories/badge-repository.js';
export async function copyTargetProfileBadges({
  originTargetProfileId,
  destinationTargetProfileId,
  badgeRepository = injectedBadgeRepository,
  badgeCriteriaRepository = injectedBadgeCriteriaRepository,
} = {}) {
  const targetProfileBadgesToCopy = await badgeRepository.findAllByTargetProfileId(originTargetProfileId);

  if (targetProfileBadgesToCopy.length) {
    await Promise.all(
      targetProfileBadgesToCopy.map(async (badge) => {
        const clonedBadge = badge.clone(destinationTargetProfileId);
        const savedBadge = await badgeRepository.save(clonedBadge);

        const badgeCriteriaToCopy = await badgeCriteriaRepository.findAllByBadgeId(badge.id);
        await copyBadgeCriteria({ badgeCriteriaToCopy, savedBadge, badgeCriteriaRepository });
      }),
    );
  }
}

const copyBadgeCriteria = async ({ badgeCriteriaToCopy, savedBadge, badgeCriteriaRepository }) => {
  return Promise.all(
    badgeCriteriaToCopy.map(async (badgeCriterionToCopy) => {
      badgeCriterionToCopy.badgeId = savedBadge.id;
      await badgeCriteriaRepository.save({ badgeCriterion: badgeCriterionToCopy });
    }),
  );
};
