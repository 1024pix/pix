module.exports = function findCampaignAssessments({ userId, filters, assessmentRepository }) {

  const campaignCode = filters.codeCampaign;

  return assessmentRepository.findLastSmartPlacementAssessmentByUserIdAndCampaignCode({ userId, campaignCode, includeCampaign: true })
    .then((assessment) => {
      if (!assessment) {
        return [];
      }
      return [assessment];
    });
};
