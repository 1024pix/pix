const _ = require('lodash');
const CampaignParticipationResultShared = require('./CampaignParticipationResultsShared');

module.exports = async function computeValidatedSkillsCount({ event, campaignParticipationRepository, knowledgeElementRepository, targetProfileWithLearningContentRepository }) {
  const campaignParticipation = await campaignParticipationRepository.get({ id: event.campaignParticipationId, options: { include: ['campaign'] } });
  if (campaignParticipation.canComputeValidatedSkillsCount()) {

    campaignParticipation.validatedSkillsCount = await _countValidatedSkills(campaignParticipation, knowledgeElementRepository, targetProfileWithLearningContentRepository);

    await campaignParticipationRepository.update(campaignParticipation);
  }
};

async function _countValidatedSkills(campaignParticipation, knowledgeElementRepository, targetProfileWithLearningContentRepository) {
  const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId: campaignParticipation.campaignId });

  const validatedSkillsCountByCompetence = await knowledgeElementRepository.countValidatedTargetedByCompetencesForOneUser(campaignParticipation.userId, campaignParticipation.sharedAt, targetProfile);
  return _(validatedSkillsCountByCompetence).values().sum();
}

module.exports.eventType = CampaignParticipationResultShared;
