module.exports = function findUserAssessmentsByFilters({ userId, filters, assessmentRepository }) {

  const filtersWithUserId = Object.assign({}, filters, { userId });
  delete filtersWithUserId.codeCampaign;

  return assessmentRepository.findByFilters(filtersWithUserId)
    .then((assessments)=> {
      if(filters.codeCampaign) {
        return assessments.filter((assessment) => {
          if(assessment.campaignParticipation) {
            return assessment.campaignParticipation.isAboutCampaignCode(filters.codeCampaign);
          }
          return false;
        });
      }
      return assessments;
    });

};
