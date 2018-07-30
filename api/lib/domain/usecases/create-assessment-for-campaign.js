const { CampaignCodeError } = require('../errors');
const CampaignParticipation = require('../models/CampaignParticipation');

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

module.exports = function createAssessmentForCampaign(
  {
    assessment,
    codeCampaign,
    assessmentRepository,
    campaignRepository,
    campaignParticipationRepository
  }) {

  let assessmentCreated;
  let campaign;

  return _checkCampaignCodeRelatedToExistingCampaign(codeCampaign, campaignRepository)
    .then((campaignFound) => {
      campaign = campaignFound;
      assessment.courseId = 'Smart Placement Tests CourseId Not Used';
      return assessmentRepository.save(assessment);
    })
    .then((assessmentCreatedInDb) => {
      assessmentCreated = assessmentCreatedInDb;
      const campaignParticipation = new CampaignParticipation({
        assessmentId: assessmentCreated.id,
        campaignId: campaign.id,
      });
      return campaignParticipationRepository.save(campaignParticipation);
    })
    .then(() => {
      return assessmentCreated;
    });
};
