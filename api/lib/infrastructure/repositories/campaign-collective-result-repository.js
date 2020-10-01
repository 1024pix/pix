const _ = require('lodash');
const { knex } = require('../bookshelf');
const BookshelfCampaignParticipation = require('../data/campaign-participation');
const CampaignCollectiveResult = require('../../domain/models/CampaignCollectiveResult');
const CampaignCompetenceCollectiveResult = require('../../domain/models/CampaignCompetenceCollectiveResult');

module.exports = {

  async getCampaignCollectiveResult(campaignId, targetProfile) {
    const participantCount = await _countSharedParticipants(campaignId);

    const participantsKECountByCompetenceId = await _fetchValidatedKECountByCompetenceId(campaignId, targetProfile);

    const campaignCompetenceCollectiveResults = _buildCampaignCompetenceCollectiveResults(campaignId, targetProfile, participantCount, participantsKECountByCompetenceId);

    return new CampaignCollectiveResult({ id: campaignId, campaignCompetenceCollectiveResults });
  },
};

function _countSharedParticipants(campaignId) {
  return BookshelfCampaignParticipation
    .query(_filterByCampaignId(campaignId))
    .query(_keepOnlySharedParticipations)
    .count();
}

function _filterByCampaignId(campaignId) {
  return (qb) => qb.where({ 'campaign-participations.campaignId': campaignId });
}

function _keepOnlySharedParticipations(qb) {
  qb.where({ 'campaign-participations.isShared': true });
}

async function _fetchValidatedKECountByCompetenceId(campaignId, targetProfile) {
  const knowledgeElements = await knex.queryBuilder()
    .modify(_selectFilteredMostRecentUntilSharedDateParticipantKEs(campaignId, targetProfile.skillIds))
    .modify(_keepOnlyValidatedKEs);

  return _.countBy(knowledgeElements, (ke) => targetProfile.getCompetenceIdOfSkill(ke.skillId));
}

function _selectFilteredMostRecentUntilSharedDateParticipantKEs(campaignId, targetedSkillIds) {
  return (qb) => qb
    .with('rankedKEs', _selectFilteredParticipantKEsWithRank(campaignId, targetedSkillIds))
    .from('rankedKEs')
    .where({ rank: 1 });
}

function _keepOnlyValidatedKEs(qb) {
  qb.where({ status: 'validated' });
}

function _selectFilteredParticipantKEsWithRank(campaignId, targetedSkillIds) {
  return (qb) => qb
    .from('knowledge-elements')
    .modify(_joinWithSharedCampaignParticipationsAndFilterBySharedAt)
    .modify(_filterByTargetSkills(targetedSkillIds))
    .modify(_filterByCampaignId(campaignId))
    .modify(_keepOnlySharedParticipations)
    .modify(_computeKERankWithinUserAndSkillByDateDescending)
    .select('*');
}

function _joinWithSharedCampaignParticipationsAndFilterBySharedAt(qb) {
  qb.innerJoin('campaign-participations', function() {
    this.on({ 'campaign-participations.userId': 'knowledge-elements.userId' })
      .andOn('knowledge-elements.createdAt', '<=', 'campaign-participations.sharedAt');
  });
}

function _filterByTargetSkills(targetedSkillIds) {
  return (qb) => qb.where('skillId', 'in', targetedSkillIds);
}

function _computeKERankWithinUserAndSkillByDateDescending(qb) {
  qb.select({
    rank: knex.raw('RANK() OVER (PARTITION BY "knowledge-elements"."userId", "knowledge-elements"."skillId" ORDER BY "knowledge-elements"."createdAt" DESC)'),
  });
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

