export async function copyBadges({
  originTargetProfileId,
  destinationTargetProfileId,
  badgeRepository,
  badgeCriteriaRepository,
}) {
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
