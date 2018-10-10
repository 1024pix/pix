const Assessment = require('../models/Assessment');

const { NotFoundError } = require('../../domain/errors');

module.exports = function startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository }) {
  return _checkCampaignExists(campaignParticipation.campaignId, campaignRepository)
    .then(() => _createSmartPlacementAssessment(userId, assessmentRepository))
    .then((assessment) => _saveCampaignParticipation(campaignParticipation, assessment, userId, campaignParticipationRepository));
};

function _checkCampaignExists(campaignId, campaignRepository) {
  return campaignRepository.get(campaignId)
    .then((campaign) => {
      if(campaign === null) {
        return Promise.reject(new NotFoundError('La campagne demandée n\'existe pas'));
      }
      return Promise.resolve();
    });
}

function _createSmartPlacementAssessment(userId, assessmentRepository) {
  const assessment = new Assessment();
  assessment.state = Assessment.states.STARTED;
  assessment.type = Assessment.types.SMARTPLACEMENT;
  assessment.courseId = 'Smart Placement Tests CourseId Not Used';
  assessment.userId = userId;
  return assessmentRepository.save(assessment);
}

function _saveCampaignParticipation(campaignParticipation, assessment, userId, campaignParticipationRepository) {
  campaignParticipation.userId = userId;
  campaignParticipation.assessmentId = assessment.id;
  return campaignParticipationRepository.save(campaignParticipation);
}
