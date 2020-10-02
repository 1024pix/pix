const _ = require('lodash');
const { knex } = require('../bookshelf');
const CampaignCollectiveResult = require('../../domain/models/CampaignCollectiveResult');
const CampaignCompetenceCollectiveResult = require('../../domain/models/CampaignCompetenceCollectiveResult');
const knowledgeElementRepository = require('./knowledge-element-repository');

module.exports = {

  async getCampaignCollectiveResult(campaignId, targetProfile) {
    const userIdsAndDates = await _getSharedParticipationsUserIdsAndDates(campaignId);
    const validatedTargetedKnowledgeElementsByUserIdAndCompetenceId =
      await knowledgeElementRepository.findValidatedTargetedGroupedByCompetencesForUsers(userIdsAndDates, targetProfile);

    const participantsKECountByCompetenceId = _countValidatedKnowledgeElementsByCompetence(validatedTargetedKnowledgeElementsByUserIdAndCompetenceId, targetProfile);

    const campaignCompetenceCollectiveResults = _buildCampaignCompetenceCollectiveResults(campaignId, targetProfile, Object.keys(userIdsAndDates).length, participantsKECountByCompetenceId);

    return new CampaignCollectiveResult({ id: campaignId, campaignCompetenceCollectiveResults });
  },
};

async function _getSharedParticipationsUserIdsAndDates(campaignId) {
  const results = await knex('campaign-participations')
    .select('userId', 'sharedAt')
    .where({ campaignId, isShared: true });

  const userIdsAndDates = {};
  for (const result of results) {
    userIdsAndDates[result.userId] = result.sharedAt;
  }

  return userIdsAndDates;
}

function _countValidatedKnowledgeElementsByCompetence(validatedKnowledgeElementsByUserByCompetence, targetProfile) {
  const validatedCountByCompetence = {};
  for (const competence of targetProfile.competences) {
    validatedCountByCompetence[competence.id] = 0;
  }

  for (const validatedKnowledgeElementsByCompetence of Object.values(validatedKnowledgeElementsByUserByCompetence)) {
    for (const [competenceId, kes] of Object.entries(validatedKnowledgeElementsByCompetence)) {
      validatedCountByCompetence[competenceId] += kes.length;
    }
  }

  return validatedCountByCompetence;
}

function _buildCampaignCompetenceCollectiveResults(campaignId, targetProfile, participantCount, participantsKECountByCompetenceId) {
  return _(targetProfile.competences).map((competence) => {
    let averageValidatedSkills = 0;
    if (participantCount && competence.id in participantsKECountByCompetenceId) {
      averageValidatedSkills = participantsKECountByCompetenceId[competence.id] / participantCount;
    }

    const area = targetProfile.getAreaOfCompetence(competence.id);
    return new CampaignCompetenceCollectiveResult({
      campaignId,
      targetedArea: area,
      targetedCompetence: competence,
      averageValidatedSkills,
    });
  })
    .sortBy('competenceIndex')
    .value();
}

