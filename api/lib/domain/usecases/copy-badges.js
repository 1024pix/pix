export async function copyBadges({
  originTargetProfileId,
  destinationTargetProfileId,
  domainTransaction,
  badgeRepository,
  badgeCriteriaRepository,
}) {
  const targetProfileBadgesToCopy = await badgeRepository.findAllByTargetProfileId(
    originTargetProfileId,
    domainTransaction,
  );

  if (targetProfileBadgesToCopy.length) {
    await Promise.all(
      targetProfileBadgesToCopy.map(async (badge) => {
        const clonedBadge = badge.clone(destinationTargetProfileId);
        const savedBadge = await badgeRepository.save(clonedBadge, domainTransaction);

        const badgeCriteriaToCopy = await badgeCriteriaRepository.findAllByBadgeId(badge.id, domainTransaction);
        await copyBadgeCriteria({ badgeCriteriaToCopy, savedBadge, badgeCriteriaRepository, domainTransaction });
      }),
    );
  }
}

const copyBadgeCriteria = async ({ badgeCriteriaToCopy, savedBadge, badgeCriteriaRepository, domainTransaction }) => {
  return Promise.all(
    badgeCriteriaToCopy.map(async (badgeCriterionToCopy) => {
      badgeCriterionToCopy.badgeId = savedBadge.id;
      await badgeCriteriaRepository.save({ badgeCriterion: badgeCriterionToCopy }, domainTransaction);
    }),
  );
};
