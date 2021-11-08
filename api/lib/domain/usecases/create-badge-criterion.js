module.exports = async function createBadgeCriterion({ badgeId, badgeCriterion, badgeCriteriaRepository }) {
  await badgeCriteriaRepository.save({
    badgeCriterion: {
      ...badgeCriterion,
      badgeId,
    },
  });
};
