const _ = require('lodash');

const Assessment = require('../models/Assessment');

const { AlreadyExistingCampaignParticipationError, NotFoundError } = require('../../domain/errors');

module.exports = async function startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository }) {
  const campaign = await campaignRepository.get(campaignParticipation.campaignId);

  if (campaign === null) {
    throw new NotFoundError('La campagne demandée n\'existe pas');
  }

  const createdCampaignParticipation = await _saveCampaignParticipation(campaignParticipation, userId, campaignParticipationRepository);
  if (campaign.isAssessment()) {
    await _createSmartPlacementAssessment(userId, assessmentRepository, createdCampaignParticipation);
  }
  return createdCampaignParticipation;
};

async function _createSmartPlacementAssessment(userId, assessmentRepository, createdCampaignParticipation) {
  const assessment = new Assessment({
    userId,
    state: Assessment.states.STARTED,
    type: Assessment.types.SMARTPLACEMENT,
    courseId: Assessment.courseIdMessage.SMART_PLACEMENT,
    campaignParticipationId: createdCampaignParticipation.id
  });
  return assessmentRepository.save(assessment);
}

async function _saveCampaignParticipation(campaignParticipation, userId, campaignParticipationRepository) {
  const campaignId = campaignParticipation.campaignId;
  const result = _.clone(campaignParticipation);
  const alreadyExistingCampaignParticipation =
    await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });
  if (alreadyExistingCampaignParticipation) {
    throw new AlreadyExistingCampaignParticipationError(`User ${userId} has already a campaign participation with campaign ${campaignId}`);
  }
  result.userId = userId;
  return campaignParticipationRepository.save(result);
}
