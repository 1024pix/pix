const Assessment = require('../models/Assessment');

const { AlreadyExistingCampaignParticipationError, NotFoundError } = require('../../domain/errors');

module.exports = async function startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository }) {
  await _checkCampaignExists(campaignParticipation.campaignId, campaignRepository);
  const campaignParticipationCreated = await _saveCampaignParticipation(campaignParticipation, userId, campaignParticipationRepository);
  await _createSmartPlacementAssessment(userId, assessmentRepository, campaignParticipationCreated);
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

async function _createSmartPlacementAssessment(userId, assessmentRepository, campaignParticipationCreated) {
  const assessment = new Assessment({
    userId,
    state: Assessment.states.STARTED,
    type: Assessment.types.SMARTPLACEMENT,
    courseId: Assessment.courseIdMessage.SMART_PLACEMENT,
    campaignParticipationId: campaignParticipationCreated.id
  });
  return assessmentRepository.save(assessment);
}

async function _saveCampaignParticipation(campaignParticipation, userId, campaignParticipationRepository) {
  const campaignId = campaignParticipation.campaignId;
  const alreadyExistingCampaignParticipation = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });
  if (alreadyExistingCampaignParticipation) {
    throw new AlreadyExistingCampaignParticipationError(`User ${userId} has already a campaign participation with campaign ${campaignId}`);
  }
  campaignParticipation.userId = userId;
  return campaignParticipationRepository.save(campaignParticipation);
}

