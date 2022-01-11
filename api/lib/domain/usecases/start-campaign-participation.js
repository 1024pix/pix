const Assessment = require('../models/Assessment');
const CampaignParticipationStarted = require('../events/CampaignParticipationStarted');
const CampaignParticipation = require('../models/CampaignParticipation');
const { EntityValidationError, AlreadyExistingCampaignParticipationError } = require('../../domain/errors');

module.exports = async function startCampaignParticipation({
  campaignParticipation,
  userId,
  campaignParticipationRepository,
  assessmentRepository,
  campaignToJoinRepository,
  schoolingRegistrationRepository,
  domainTransaction,
}) {
  const campaignToJoin = await campaignToJoinRepository.get(campaignParticipation.campaignId, domainTransaction);

  await campaignToJoinRepository.checkCampaignIsJoinableByUser(campaignToJoin, userId, domainTransaction);

  const hasAlreadyParticipated = await campaignParticipationRepository.hasAlreadyParticipated(
    campaignToJoin.id,
    userId,
    domainTransaction
  );
  if (campaignToJoin.idPixLabel && !campaignParticipation.participantExternalId) {
    if (campaignToJoin.multipleSendings && hasAlreadyParticipated) {
      campaignParticipation.participantExternalId = await campaignParticipationRepository.findParticipantExternalId(
        campaignToJoin.id,
        userId,
        domainTransaction
      );
    } else {
      throw new EntityValidationError({
        invalidAttributes: [
          {
            attribute: 'participantExternalId',
            message: 'Un identifiant externe est requis pour accèder à la campagne.',
          },
        ],
      });
    }
  }

  if (hasAlreadyParticipated && !campaignToJoin.multipleSendings) {
    throw new AlreadyExistingCampaignParticipationError(
      `User ${userId} has already a campaign participation with campaign ${campaignToJoin.id}`
    );
  }

  let createdCampaignParticipation;
  if (hasAlreadyParticipated) {
    await campaignParticipationRepository.markPreviousParticipationsAsImproved(
      campaignToJoin.id,
      userId,
      domainTransaction
    );
    createdCampaignParticipation = await _saveCampaignParticipation(
      campaignParticipation,
      userId,
      campaignToJoin,
      campaignParticipationRepository,
      schoolingRegistrationRepository,
      domainTransaction
    );
    if (campaignToJoin.isAssessment) {
      const assessment = Assessment.createImprovingForCampaign({
        userId,
        campaignParticipationId: createdCampaignParticipation.id,
        method: campaignToJoin.assessmentMethod,
      });
      await assessmentRepository.save({ assessment, domainTransaction });
    }
  } else {
    createdCampaignParticipation = await _saveCampaignParticipation(
      campaignParticipation,
      userId,
      campaignToJoin,
      campaignParticipationRepository,
      schoolingRegistrationRepository,
      domainTransaction
    );
    if (campaignToJoin.isAssessment) {
      const assessment = Assessment.createForCampaign({
        userId,
        campaignParticipationId: createdCampaignParticipation.id,
        method: campaignToJoin.assessmentMethod,
      });
      await assessmentRepository.save({ assessment, domainTransaction });
    }
  }

  return {
    event: new CampaignParticipationStarted({ campaignParticipationId: createdCampaignParticipation.id }),
    campaignParticipation: createdCampaignParticipation,
  };
};

async function _saveCampaignParticipation(
  campaignParticipation,
  userId,
  campaign,
  campaignParticipationRepository,
  schoolingRegistrationRepository,
  domainTransaction
) {
  const schoolingRegistration = await schoolingRegistrationRepository.findOneByUserIdAndOrganizationId({
    organizationId: campaign.organizationId,
    userId,
    domainTransaction,
  });
  const userParticipation = CampaignParticipation.start({
    ...campaignParticipation,
    campaign,
    userId,
    schoolingRegistrationId: schoolingRegistration?.id,
  });

  return campaignParticipationRepository.save(userParticipation, domainTransaction);
}
