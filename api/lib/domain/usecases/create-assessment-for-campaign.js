
const { CampaignCodeError } = require('../errors');
const CampaignParticipation = require('../models/CampaignParticipation');
const Assessment = require('../models/Assessment');

async function _getCampaignFromCode(codeCampaign, campaignRepository) {
  const campaign = await campaignRepository.getByCode(codeCampaign);
  if (campaign) {
    return campaign;
  }
  throw new CampaignCodeError();
}

module.exports = async function createAssessmentForCampaign(
  {
    userId,
    assessment,
    codeCampaign,
    participantExternalId,
    assessmentRepository,
    campaignRepository,
    campaignParticipationRepository
  }) {

  const campaign = await _getCampaignFromCode(codeCampaign, campaignRepository);

  const campaignParticipation = new CampaignParticipation({
    userId,
    campaignId: campaign.id,
    participantExternalId
  });

  const campaignParticipationCreated = await campaignParticipationRepository.save(campaignParticipation);

  assessment.state = Assessment.states.STARTED;
  assessment.courseId = Assessment.courseIdMessage.SMART_PLACEMENT;
  assessment.campaignParticipationId = campaignParticipation.id;

  const assessmentCreated = await assessmentRepository.save(assessment);

  await campaignParticipationRepository.updateAssessmentId({ id: campaignParticipationCreated.id, assessmentId: assessmentCreated.id });

  return assessmentCreated;
};
