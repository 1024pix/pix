module.exports = async function createBadgeCriteria({ badgeId, badgeCriterion, badgeCriteriaRepository }) {
  await badgeCriteriaRepository.save({
    badgeCriterion: {
      ...badgeCriterion,
      badgeId,
    },
  });
};
