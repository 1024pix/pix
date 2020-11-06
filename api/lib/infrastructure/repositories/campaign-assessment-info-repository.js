const { knex } = require('../bookshelf');
const { NotFoundError } = require('../../../lib/domain/errors');
const CampaignAssessmentInfo = require('../../../lib/domain/read-models/CampaignAssessmentInfo');

module.exports = {
  async getByCampaignParticipationId(campaignParticipationId) {
    const result = await knex('campaign-participations')
      .select([
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.isShared AS isShared',
        'campaign-participations.userId AS userId',
        'campaign-participations.campaignId AS campaignId',
        'assessments.id AS assessmentId',
        'assessments.state AS assessmentState',
        'assessments.isImproving AS isImproving',
      ])
      .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
      .leftJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
      .where('campaign-participations.id', '=', campaignParticipationId)
      .andWhere('campaigns.type', '=', 'ASSESSMENT')
      .orderBy('assessments.createdAt', 'desc')
      .first();

    if (!result) {
      throw new NotFoundError('Campaign Participation not found.');
    }

    return new CampaignAssessmentInfo(result);
  },
};
