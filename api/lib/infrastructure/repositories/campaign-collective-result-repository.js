const _ = require('lodash');
const bluebird = require('bluebird');
const { knex } = require('../bookshelf');
const CampaignCollectiveResult = require('../../domain/read-models/CampaignCollectiveResult');
const knowledgeElementRepository = require('./knowledge-element-repository');
const constants = require('../constants');

module.exports = {

  async getCampaignCollectiveResult(campaignId, targetProfile) {
    const campaignCollectiveResult = new CampaignCollectiveResult({ id: campaignId, targetProfile });

    const userIdsAndSharedDatesChunks = await _getChunksSharedParticipationsWithUserIdsAndDates(campaignId);

    let participantCount = 0;
    await bluebird.mapSeries(userIdsAndSharedDatesChunks, async (userIdsAndSharedDates) => {
      participantCount += userIdsAndSharedDates.length;
      const validatedTargetedKnowledgeElementsByUserIdAndCompetenceId =
        await knowledgeElementRepository.findValidatedTargetedGroupedByCompetencesForUsers(Object.fromEntries(userIdsAndSharedDates), targetProfile);
      const participantsKECountByCompetenceId = _countValidatedKnowledgeElementsByCompetence(validatedTargetedKnowledgeElementsByUserIdAndCompetenceId, targetProfile);
      campaignCollectiveResult.addValidatedSkillCountToCompetences(participantsKECountByCompetenceId);
    });

    campaignCollectiveResult.finalize(participantCount);
    return campaignCollectiveResult;
  },
};

async function _getChunksSharedParticipationsWithUserIdsAndDates(campaignId) {
  const results = await knex('campaign-participations')
    .select('userId', 'sharedAt')
    .where({ campaignId, isShared: true });

  const userIdsAndDates = [];
  for (const result of results) {
    userIdsAndDates.push([result.userId, result.sharedAt]);
  }

  return _.chunk(userIdsAndDates, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
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

