
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
  assessment.state = Assessment.states.STARTED;

  const campaign = await _getCampaignFromCode(codeCampaign, campaignRepository);
  assessment.courseId = 'Smart Placement Tests CourseId Not Used';

  const assessmentCreated = await assessmentRepository.save(assessment);
  const campaignParticipation = new CampaignParticipation({
    userId,
    assessmentId: assessmentCreated.id,
    campaignId: campaign.id,
    participantExternalId
  });
  const campaignParticipationCreated = await campaignParticipationRepository.save(campaignParticipation);
  await assessmentRepository.updateCampaignParticipationId({
    id: assessment.id,
    campaignParticipationId: campaignParticipationCreated.id
  });

  return assessmentRepository.get(assessment.id);
};
