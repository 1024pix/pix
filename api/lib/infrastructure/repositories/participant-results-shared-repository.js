const { knex } = require('../../../db/knex-database-connection');
const skillDatasource = require('../datasources/learning-content/skill-datasource');
const ParticipantResultsShared = require('../../../lib/domain/models/ParticipantResultsShared');

async function _fetchTargetedSkillIds(campaignParticipationId) {
  const skillIds = await knex('campaign-participations')
    .pluck('skillId')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .join('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'campaigns.targetProfileId')
    .where('campaign-participations.id', campaignParticipationId);

  const targetedSkills = await skillDatasource.findOperativeByRecordIds(skillIds);
  return targetedSkills.map(({ id }) => id);
}

async function _fetchKnowledgeElements(campaignParticipationId) {
  const { snapshot: knowledgeElements } = await knex('campaign-participations')
    .select('snapshot')
    .join('knowledge-element-snapshots', function () {
      this.on('knowledge-element-snapshots.userId', '=', 'campaign-participations.userId').andOn(
        'knowledge-element-snapshots.snappedAt',
        '=',
        'campaign-participations.sharedAt'
      );
    })
    .where('campaign-participations.id', campaignParticipationId)
    .first();
  return knowledgeElements;
}

const participantResultsSharedRepository = {
  async get(campaignParticipationId) {
    const targetedSkillIds = await _fetchTargetedSkillIds(campaignParticipationId);
    const knowledgeElements = await _fetchKnowledgeElements(campaignParticipationId);

    return new ParticipantResultsShared({ campaignParticipationId, knowledgeElements, targetedSkillIds });
  },
};

module.exports = participantResultsSharedRepository;
