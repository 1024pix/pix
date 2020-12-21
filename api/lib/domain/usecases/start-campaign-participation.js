const Assessment = require('../models/Assessment');
const CampaignParticipationStarted = require('../events/CampaignParticipationStarted');
const CampaignParticipation = require('../models/CampaignParticipation');
const { AlreadyExistingCampaignParticipationError, ForbiddenAccess } = require('../../domain/errors');

module.exports = async function startCampaignParticipation({
  campaignParticipation,
  userId,
  campaignParticipationRepository,
  assessmentRepository,
  campaignToJoinRepository,
  schoolingRegistrationRepository,
  domainTransaction,
}) {
  const campaignToJoin = await campaignToJoinRepository.get(campaignParticipation.campaignId);
  if (campaignToJoin.isArchived()) {
    throw new ForbiddenAccess('Vous n\'êtes pas autorisé à rejoindre la campagne');
  }

  if (campaignToJoin.isRestricted) {
    const schoolingRegistration = await schoolingRegistrationRepository.findOneByUserIdAndOrganizationId({
      userId,
      organizationId: campaignToJoin.organizationId,
    });
    if (!schoolingRegistration) {
      throw new ForbiddenAccess('Vous n\'êtes pas autorisé à rejoindre la campagne');
    }
  }

  const createdCampaignParticipation = await _saveCampaignParticipation(campaignParticipation, userId, campaignParticipationRepository, domainTransaction);

  if (campaignToJoin.isAssessment()) {
    await _createCampaignAssessment(userId, createdCampaignParticipation.id, assessmentRepository, domainTransaction);
  }

  return {
    event: new CampaignParticipationStarted({ campaignParticipationId: createdCampaignParticipation.id }),
    campaignParticipation: createdCampaignParticipation,
  };
};

async function _createCampaignAssessment(userId, campaignParticipationId, assessmentRepository, domainTransaction) {
  const assessment = Assessment.createForCampaign({ userId, campaignParticipationId });
  return assessmentRepository.save({ assessment, domainTransaction });
}

async function _saveCampaignParticipation(campaignParticipation, userId, campaignParticipationRepository, domainTransaction) {
  const { campaignId } = campaignParticipation;
  const alreadyExistingCampaignParticipation = await campaignParticipationRepository.findOneByCampaignIdAndUserId({ campaignId, userId });
  if (alreadyExistingCampaignParticipation) {
    throw new AlreadyExistingCampaignParticipationError(`User ${userId} has already a campaign participation with campaign ${campaignId}`);
  }

  const userParticipation = new CampaignParticipation({ ...campaignParticipation, userId });
  return campaignParticipationRepository.save(userParticipation, domainTransaction);
}
