module.exports = function findSmartPlacementAssessments({ userId, filters, assessmentRepository }) {

  const campaignCode = filters.codeCampaign;

  return assessmentRepository.getLastSmartPlacementAssessmentByUserIdAndCampaignCode({ userId, campaignCode, includeCampaign: true })
    .then((assessment) => {
      if (!assessment) {
        return [];
      }
      return [assessment];
    });
};
