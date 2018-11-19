const _ = require('lodash');

module.exports = function findUserAssessmentsByFilters({ userId, filters, assessmentRepository }) {

  if(filters.codeCampaign) {
    const filtersOfAssessment = {
      userId,
      type: 'SMART_PLACEMENT',
    };

    return assessmentRepository.findByCampaignFilters(filtersOfAssessment)
      .then((assessments)=> {
        return assessments.filter((assessment) => {
          if(assessment.campaignParticipation) {
            return assessment.campaignParticipation.isAboutCampaignCode(filters.codeCampaign);
          }
          return false;
        });
      });
  }

  if(['CERTIFICATION', 'PLACEMENT'].includes(filters.type) && filters.courseId) {

    filters = _.pick(filters, ['type', 'courseId', 'state']);
    const filtersOfAssessment = {
      ...filters,
      userId,
    };

    return assessmentRepository.getByFilters(filtersOfAssessment)
      .then((assessment) => {
        if(!assessment) {
          return [];
        }
        return [assessment];
      });
  }

  return Promise.resolve([]);
};
