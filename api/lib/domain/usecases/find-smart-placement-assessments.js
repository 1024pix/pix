module.exports = function findSmartPlacementAssessments({ userId, filters, assessmentRepository }) {

  const campaignCode = filters.codeCampaign;
  return assessmentRepository.findSmartPlacementAssessmentsByUserId(userId)
    .then((assessments)=> {
      return assessments.filter((assessment) => {
        if(assessment.campaignParticipation) {
          return assessment.campaignParticipation.isAboutCampaignCode(campaignCode);
        }
        return false;
      });
    });
};
