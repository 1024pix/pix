module.exports = function findUserAssessmentsByFilters({ userId, filters, assessmentRepository }) {

  if(filters.codeCampaign) {
    const filtersOfAssessment = {
      userId,
      type: 'SMART_PLACEMENT',
    };

    return assessmentRepository.findByFilters(filtersOfAssessment)
      .then((assessments)=> {
        return assessments.filter((assessment) => {
          if(assessment.campaignParticipation) {
            return assessment.campaignParticipation.isAboutCampaignCode(filters.codeCampaign);
          }
          return false;
        });
      });
  }

  if(filters.type === 'CERTIFICATION' && filters.courseId) {
    return assessmentRepository.getByCertificationCourseId(filters.courseId)
      .then((assessment) => {
        if(assessment.userId == userId) {
          return [assessment];
        }
        return [];
      });
  }

  return Promise.resolve([]);
};
