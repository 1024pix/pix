const _ = require('lodash');

const { knex } = require('../bookshelf');
const BookshelfCampaign = require('../data/campaign');
const BookshelfCampaignParticipation = require('../data/campaign-participation');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const CampaignCollectiveResult = require('../../domain/models/CampaignCollectiveResult');
const CampaignCompetenceCollectiveResult = require('../../domain/models/CampaignCompetenceCollectiveResult');

module.exports = {

  async getCampaignCollectiveResult(campaignId, competences) {

    const { targetedSkillIds, targetedSkills, participantCount } = await _fetchData(campaignId);

    const participantsKECountByCompetenceId = await _fetchValidatedKECountByCompetenceId(campaignId, targetedSkillIds, competences);

    const { targetedSkillsByCompetenceId } = _groupByCompetenceId(targetedSkills);

    const campaignCompetenceCollectiveResults = _forgeCampaignCompetenceCollectiveResults(campaignId, competences, participantCount, targetedSkillsByCompetenceId, participantsKECountByCompetenceId);

    return new CampaignCollectiveResult({ id: campaignId, campaignCompetenceCollectiveResults });
  }
};

async function _fetchData(campaignId) {

  const [campaign, participantCount] = await Promise.all([
    _fetchCampaignWithTargetProfileSkills(campaignId),
    _countSharedParticipants(campaignId),
  ]);

  const targetedSkillIds = campaign.related('targetProfile').related('skillIds').map((targetProfileSkill) => targetProfileSkill.get('skillId'));
  const targetedSkills = await skillDatasource.findByRecordIds(targetedSkillIds);

  return { targetedSkillIds, targetedSkills, participantCount };
}

function _fetchCampaignWithTargetProfileSkills(campaignId) {
  return BookshelfCampaign.where({ id: campaignId }).fetch({
    withRelated: 'targetProfile.skillIds'
  });
}

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

async function _fetchValidatedKECountByCompetenceId(campaignId, targetedSkillIds, competences) {
  const knowledgeElements = await knex.queryBuilder()
    .modify(_selectFilteredMostRecentUntilSharedDateParticipantKEs(campaignId, targetedSkillIds))
    .modify(_keepOnlyValidatedKEs);

  return _.countBy(knowledgeElements, (ke) => {
    const competence = competences.find((c) => c.skillIds.includes(ke.skillId));
    if (competence) return competence.id;
    return null; 
  });
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
    rank: knex.raw('RANK() OVER (PARTITION BY "knowledge-elements"."userId", "knowledge-elements"."skillId" ORDER BY "knowledge-elements"."createdAt" DESC)')
  });
}

function _groupByCompetenceId(targetedSkills) {
  const targetedSkillsByCompetenceId = _.groupBy(targetedSkills, 'competenceId');

  return { targetedSkillsByCompetenceId };
}

function _forgeCampaignCompetenceCollectiveResults(campaignId, competences, participantCount, targetedSkillsByCompetenceId, participantsKECountByCompetenceId) {
  return _(targetedSkillsByCompetenceId).keys().map((competenceId) => {
    const competence = _.find(competences, { id: competenceId });
    const averageValidatedSkills = (participantCount && competenceId in participantsKECountByCompetenceId) ?
      participantsKECountByCompetenceId[competenceId] / participantCount : 0;
    return new CampaignCompetenceCollectiveResult({
      campaignId,
      competenceId,
      competenceName: competence.name,
      competenceIndex: competence.index,
      areaColor: competence.area.color,
      totalSkillsCount: _.size(targetedSkillsByCompetenceId[competenceId]),
      averageValidatedSkills,
    });
  })
    .sortBy('competenceIndex')
    .value();
}

