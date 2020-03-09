function areBadgeCriteriaFulfilled({ campaignParticipationResult }) {
  return (campaignParticipationResult.masteryPercentage >= 85);
}

module.exports = {
  areBadgeCriteriaFulfilled,
};
