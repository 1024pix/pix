const _ = require('lodash');

class CampaignParticipationRepository {
  constructor(queryBuilder) {
    this.queryBuilder = queryBuilder;
  }

  async save(campaignParticipation) {
    const attributes = _.omit(campaignParticipation, ['assessmentId', 'assessments', 'user', 'campaign', 'createdAt']);
    const [id] = await this.queryBuilder('campaign-participations').insert(attributes).returning('id');
    campaignParticipation.id = id;
  }

  async markPreviousParticipationsAsImproved(campaignId, userId) {
    return this.queryBuilder('campaign-participations')
      .where({ campaignId, userId })
      .update({
        isImproved: true,
      });
  }

  async hasAlreadyParticipated(campaignId, userId) {
    const { count } = await this.queryBuilder('campaign-participations')
      .count('id')
      .where({ campaignId, userId })
      .first();
    return count > 0;
  }
}

module.exports = CampaignParticipationRepository;
