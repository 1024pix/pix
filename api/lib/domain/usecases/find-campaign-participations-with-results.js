const CampaignParticipationResult = require('../../domain/models/CampaignParticipationResult');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const _ = require('lodash');

module.exports = async function findCampaignParticipationsWithResults({
  userId,
  options,
  campaignRepository,
  competenceRepository,
  targetProfileRepository,
  campaignParticipationRepository,
  assessmentRepository
}) {
  const campaignId = options.filter.campaignId;

  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not belong to an organization that owns the campaign');
  }
  const [ campaignParticipations, targetProfile, competences ] = await Promise.all([
    campaignParticipationRepository.findPaginatedCampaignParticipations(options),
    targetProfileRepository.getByCampaignId(campaignId),
    competenceRepository.list(),
  ]);

  campaignParticipations.models = await Promise.all(_.map(campaignParticipations.models, (campaignParticipation) => _getAssessmentForCampaignParticipation(campaignParticipation, assessmentRepository)));

  for (const campaignParticipation of campaignParticipations.models) {
    const { user: { knowledgeElements } } = campaignParticipation;

    const campaignParticipationResult = CampaignParticipationResult.buildFrom({
      campaignParticipationId: campaignParticipation.id, competences, targetProfile, assessment: campaignParticipation.assessment, knowledgeElements
    });

    campaignParticipation.campaignParticipationResult = campaignParticipationResult;
  }

  return campaignParticipations;

};

async function _getAssessmentForCampaignParticipation(campaignParticipation, assessmentRepository) {
  campaignParticipation.assessment = await assessmentRepository.get(campaignParticipation.assessmentId);
  return campaignParticipation;
}
