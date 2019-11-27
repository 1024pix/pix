const _ = require('lodash');

const BookshelfCampaign = require('../data/campaign');
const BookshelfKnowledgeElement = require('../data/knowledge-element');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const CampaignCollectiveResult = require('../../domain/models/CampaignCollectiveResult');
const CampaignCompetenceCollectiveResult = require('../../domain/models/CampaignCompetenceCollectiveResult');

module.exports = {

  async getCampaignCollectiveResult(campaignId) {

    const { competences, campaign, filteredKEsPerParticipant, targetedSkills } = await _fetchData(campaignId);
    const { participantCount, participantsKEs } = _filterData(campaign, filteredKEsPerParticipant);
    const { participantsKEsByCompetenceId, targetedSkillsByCompetenceId } = _groupByCompetenceId(participantsKEs, targetedSkills);
    const campaignCompetenceCollectiveResults = _forgeCampaignCompetenceCollectiveResults(campaignId, competences, participantCount, targetedSkillsByCompetenceId, participantsKEsByCompetenceId);

    return new CampaignCollectiveResult({ id: campaignId, campaignCompetenceCollectiveResults });
  }
};

async function _fetchData(campaignId) {

  const [competences, campaign ] = await Promise.all([
    competenceDatasource.list(),
    _fetchCampaignWithRelatedData(campaignId),
  ]);

  const targetedSkillIds = campaign.related('targetProfile').related('skillIds').map((targetProfileSkill) => targetProfileSkill.get('skillId'));
  const targetedSkills = await skillDatasource.findByRecordIds(targetedSkillIds);

  const filteredKEsPerParticipant = await _fetchFilteredKEsPerParticipant(campaignId, targetedSkillIds);

  return { competences, campaign, filteredKEsPerParticipant, targetedSkillIds, targetedSkills };
}

function _filterData(campaign, filteredKEsPerParticipant) {
  const participantsKEs = _extractCurrentValidatedParticipantKEs(filteredKEsPerParticipant);

  return { participantCount: _.size(filteredKEsPerParticipant), participantsKEs };
}

function _groupByCompetenceId(participantsKEs, targetedSkills) {

  const participantsKEsByCompetenceId = _.groupBy(participantsKEs, (bookshelfKE) => bookshelfKE.get('competenceId'));
  const targetedSkillsByCompetenceId = _.groupBy(targetedSkills, 'competenceId');

  return { participantsKEsByCompetenceId, targetedSkillsByCompetenceId };
}

function _fetchCampaignWithRelatedData(campaignId) {
  return BookshelfCampaign.where({ id: campaignId }).fetch({
    withRelated: [
      'targetProfile.skillIds'
    ]
  });
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

function _filterByCampaignId(campaignId) {
  return (qb) => qb.where({ 'campaign-participations.campaignId': campaignId });
}

function _keepOnlySharedParticipations(qb) {
  qb.where({ 'campaign-participations.isShared': true });
}

async function _fetchFilteredKEsPerParticipant(campaignId, targetedSkillIds) {
  const { models: participantKEsSharedAndInTargetProfile } = await BookshelfKnowledgeElement
    .query(_joinWithSharedCampaignParticipationsAndFilterBySharedAt)
    .query(_filterByTargetSkills(targetedSkillIds))
    .query(_filterByCampaignId(campaignId))
    .query(_keepOnlySharedParticipations)
    .fetchAll();

  const filteredKEsPerParticipant = _.values(_.groupBy(participantKEsSharedAndInTargetProfile, 'attributes.userId'));

  return filteredKEsPerParticipant;
}

function _extractCurrentValidatedParticipantKEs(filteredKEsPerParticipant) {

  return _.flatMap(filteredKEsPerParticipant, (participantKEs) => {
    const sortedByDateKEs = _.orderBy(participantKEs, 'attributes.createdAt', 'desc');
    const uniqueBySkillIdKEs = _.uniqBy(sortedByDateKEs, 'attributes.skillId');
    return _.filter(uniqueBySkillIdKEs, ((ke) => ke.isValidated()));
  });
}

function _forgeCampaignCompetenceCollectiveResults(campaignId, competences, participantCount, targetedSkillsByCompetenceId, participantsKEsByCompetenceId) {
  return _(targetedSkillsByCompetenceId).keys().map((competenceId) => {
    const competence = _.find(competences, { id: competenceId });
    const averageValidatedSkills = participantCount ? _.size(participantsKEsByCompetenceId[competenceId]) / participantCount : 0;
    return new CampaignCompetenceCollectiveResult({
      campaignId,
      competenceId,
      competenceName: competence.name,
      competenceIndex: competence.index,
      totalSkillsCount: _.size(targetedSkillsByCompetenceId[competenceId]),
      averageValidatedSkills,
    });
  })
    .sortBy('competenceIndex')
    .value();
}
