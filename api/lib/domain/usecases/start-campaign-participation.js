const Assessment = require('../models/Assessment');

const { NotFoundError } = require('../../domain/errors');

module.exports = async function startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository }) {
  await _checkCampaignExists(campaignParticipation.campaignId, campaignRepository);
  const assessment = await _createSmartPlacementAssessment(userId, assessmentRepository);
  const campaignParticipationCreated = await _saveCampaignParticipation(campaignParticipation, assessment, userId, campaignParticipationRepository);
  await _updateAssessmentWithCampaignParticipation(assessmentRepository, assessment, campaignParticipationCreated);
  return campaignParticipationCreated;
};

async function _checkCampaignExists(campaignId, campaignRepository) {
  return campaignRepository.get(campaignId)
    .then((campaign) => {
      if (campaign === null) {
        return Promise.reject(new NotFoundError('La campagne demandée n\'existe pas'));
      }
      return Promise.resolve();
    });
}

async function _createSmartPlacementAssessment(userId, assessmentRepository) {
  const assessment = new Assessment({
    userId,
    state: Assessment.states.STARTED,
    type: Assessment.types.SMARTPLACEMENT,
    courseId: 'Smart Placement Tests CourseId Not Used'
  });
  return assessmentRepository.save(assessment);
}

async function _saveCampaignParticipation(campaignParticipation, assessment, userId, campaignParticipationRepository) {
  campaignParticipation.userId = userId;
  campaignParticipation.assessmentId = assessment.id;
  return campaignParticipationRepository.save(campaignParticipation);
}

async function _updateAssessmentWithCampaignParticipation(assessmentRepository, assessment, campaignParticipationCreated) {
  return assessmentRepository.updateCampaignParticipationId({
    id: assessment.id,
    campaignParticipationId: campaignParticipationCreated.id
  });
}
