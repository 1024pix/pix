const Assessment = require('../models/Assessment');

const { AlreadyExistingCampaignParticipationError, NotFoundError } = require('../../domain/errors');
const CampaignParticipationStarted = require('../events/CampaignParticipationStarted');
const CampaignParticipation = require('../models/CampaignParticipation');

module.exports = async function startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository, campaignRepository }) {
  const campaign = await campaignRepository.get(campaignParticipation.campaignId);

  if (campaign === null) {
    throw new NotFoundError('La campagne demandée n\'existe pas');
  }

  const createdCampaignParticipation = await _saveCampaignParticipation(campaignParticipation, userId, campaignParticipationRepository);
  if (campaign.isAssessment()) {
    await _createCampaignAssessment(userId, assessmentRepository, createdCampaignParticipation);
  }

  return {
    event: new CampaignParticipationStarted({ campaignParticipationId: createdCampaignParticipation.id }),
    campaignParticipation: createdCampaignParticipation,
  };
};

async function _createCampaignAssessment(userId, assessmentRepository, createdCampaignParticipation) {
  const assessment = new Assessment({
    userId,
    state: Assessment.states.STARTED,
    type: Assessment.types.CAMPAIGN,
    courseId: Assessment.courseIdMessage.CAMPAIGN,
    campaignParticipationId: createdCampaignParticipation.id,
  });
  return assessmentRepository.save({ assessment });
}

async function _saveCampaignParticipation(campaignParticipation, userId, campaignParticipationRepository) {
  const { campaignId } = campaignParticipation;
  const alreadyExistingCampaignParticipation = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });
  if (alreadyExistingCampaignParticipation) {
    throw new AlreadyExistingCampaignParticipationError(`User ${userId} has already a campaign participation with campaign ${campaignId}`);
  }

  const userParticipation = new CampaignParticipation({ ...campaignParticipation, userId });
  return campaignParticipationRepository.save(userParticipation);
}
