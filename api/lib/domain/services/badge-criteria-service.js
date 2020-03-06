function reviewBadgeCriteria({ campaignParticipationResult }) {
  return (campaignParticipationResult.masteryPercentage >= 85);
}

module.exports = {
  reviewBadgeCriteria,
};
