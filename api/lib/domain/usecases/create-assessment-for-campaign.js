const { CampaignCodeError } = require('../errors');

function _checkCampaignCodeRelatedToExistingCampaign(codeCampaign, campaignRepository) {
  return campaignRepository.getByCode(codeCampaign)
    .then((campaign) => {
      if(campaign) {
        return campaign;
      } else {
        return Promise.reject(new CampaignCodeError());
      }
    });
}

module.exports = function createAssessmentForCampaign({ assessment, codeCampaign, assessmentRepository, campaignRepository }) {

  return _checkCampaignCodeRelatedToExistingCampaign(codeCampaign, campaignRepository)
    .then(() => {
      assessment.courseId = 'Smart Placement Tests CourseId Not Used';
      return assessmentRepository.save(assessment);
    });
};
