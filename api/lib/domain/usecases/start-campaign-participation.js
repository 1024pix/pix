const Assessment = require('../models/Assessment');
const CampaignParticipationStarted = require('../events/CampaignParticipationStarted');
const CampaignParticipation = require('../models/CampaignParticipation');
const { EntityValidationError } = require('../../domain/errors');

async function startCampaignParticipation({
  campaignParticipation,
  userId,
  campaignParticipationRepositoryTrx,
  assessmentRepositoryTrx,
  campaignToJoinRepositoryTrx,
}) {
  const campaignToJoin = await campaignToJoinRepositoryTrx.get(campaignParticipation.campaignId);

  if (campaignToJoin.idPixLabel && !campaignParticipation.participantExternalId)
    throw new EntityValidationError('Un identifiant externe est requis pour accèder à la campagne.');

  await campaignToJoinRepositoryTrx.checkCampaignIsJoinableByUser(campaignToJoin, userId);
  let createdCampaignParticipation;

  if (await campaignParticipationRepositoryTrx.hasAlreadyParticipated(campaignToJoin.id, userId)) {
    await campaignParticipationRepositoryTrx.markPreviousParticipationsAsImproved(campaignToJoin.id, userId);
    createdCampaignParticipation = await _saveCampaignParticipation(campaignParticipation, userId, campaignParticipationRepositoryTrx);
    if (campaignToJoin.isAssessment) {
      const assessment = Assessment.createImprovingForCampaign({ userId, campaignParticipationId: createdCampaignParticipation.id });
      await assessmentRepositoryTrx.save({ assessment });
    }
  } else {
    createdCampaignParticipation = await _saveCampaignParticipation(campaignParticipation, userId, campaignParticipationRepositoryTrx);
    if (campaignToJoin.isAssessment) {
      const assessment = Assessment.createForCampaign({ userId, campaignParticipationId: createdCampaignParticipation.id });
      await assessmentRepositoryTrx.save({ assessment });
    }
  }
  return {
    event: new CampaignParticipationStarted({ campaignParticipationId: createdCampaignParticipation.id }),
    campaignParticipation: createdCampaignParticipation,
  };
};

async function _saveCampaignParticipation(campaignParticipation, userId, campaignParticipationRepositoryTrx) {
  const userParticipation = new CampaignParticipation({ ...campaignParticipation, userId });
  await campaignParticipationRepositoryTrx.save(userParticipation);
  return userParticipation;
}

module.exports = {
  perform: startCampaignParticipation,
  useTransaction: true,
}
