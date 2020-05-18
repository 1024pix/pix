const { knex } = require('../bookshelf');
const CampaignProfilesCollectionParticipationSummary = require('../../domain/models/CampaignProfilesCollectionParticipationSummary');

const CampaignProfilesCollectionParticipationSummaryRepository = {
  async findByCampaignId(campaignId) {
    const results = await knex
      .select('campaign-participations.id AS campaignParticipationId', 'users.firstName', 'users.lastName', 'campaign-participations.participantExternalId', 'campaign-participations.sharedAt')
      .from('campaign-participations')
      .join('users', 'users.id', 'campaign-participations.userId')
      .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
      .where('campaign-participations.campaignId', '=', campaignId)
      .orderByRaw('LOWER("lastName") ASC, LOWER("firstName") ASC');

    return results.map((result) => new CampaignProfilesCollectionParticipationSummary(result));
  }
};

module.exports = CampaignProfilesCollectionParticipationSummaryRepository;
