const CampaignAssessmentParticipationResult = require('../../../lib/domain/read-models/CampaignAssessmentParticipationResult');
const { NotFoundError } = require('../../../lib/domain/errors');
const { knex } = require('../bookshelf');
const competenceRepository = require('./competence-repository');
const knowledgeElementRepository = require('./knowledge-element-repository');
const targetProfileRepository = require('./target-profile-repository');

module.exports = {
  async getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId }) {
    const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);
    const targetedSkillIds = targetProfile.skills.map(({ id }) => id);

    const result = await _fetchCampaignAssessmentParticipationResultAttributesFromCampaignParticipation(campaignId, campaignParticipationId);

    return _buildCampaignAssessmentParticipationResults(result, targetedSkillIds);
  },
};

async function _fetchCampaignAssessmentParticipationResultAttributesFromCampaignParticipation(campaignId, campaignParticipationId) {

  const [campaignAssessmentParticipationResult] = await knex.with('campaignAssessmentParticipationResult',
    (qb) => {
      qb.select([
        'users.id AS userId',
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.campaignId',
        'campaign-participations.sharedAt',
        'campaign-participations.isShared',
      ])
        .from('campaign-participations')
        .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
        .join('users', 'users.id', 'campaign-participations.userId')
        .leftJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
        .where({
          campaignId,
          'campaign-participations.id': campaignParticipationId,
        });
    })
    .from('campaignAssessmentParticipationResult');

  if (campaignAssessmentParticipationResult == null) {
    throw new NotFoundError(`There is no campaign participation with the id "${campaignParticipationId}"`);
  }

  return campaignAssessmentParticipationResult;
}

async function _buildCampaignAssessmentParticipationResults(result, targetedSkillIds) {
  const competences = await competenceRepository.list();

  const knowledgeElementsByUserIdAndCompetenceId = await knowledgeElementRepository
    .findSnapshotGroupedByCompetencesForUsers({ [result.userId]: result.sharedAt });
  const knowledgeElementsForUserByCompetenceId = knowledgeElementsByUserIdAndCompetenceId[result.userId];

  return new CampaignAssessmentParticipationResult({
    ...result,
    competences,
    knowledgeElementsByCompetenceId: knowledgeElementsForUserByCompetenceId,
    targetedSkillIds,
  });
}
