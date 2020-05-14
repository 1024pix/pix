const { knex } = require('../bookshelf');
const CampaignProfilesCollectionParticipantSummary = require('../../domain/models/CampaignProfilesCollectionParticipantSummary');

const CampaignProfilesCollectionParticipantSummaryRepository = {
  async findByCampaignId(campaignId) {
    const results = await knex
      .select('campaign-participations.id AS campaignParticipationId', 'users.firstName', 'users.lastName', 'campaign-participations.participantExternalId', 'campaign-participations.sharedAt')
      .from('campaign-participations')
      .join('users', 'users.id', 'campaign-participations.userId')
      .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
      .where('campaign-participations.campaignId', '=', campaignId)
      .orderByRaw('LOWER("lastName") ASC, LOWER("firstName") ASC');

    return results.map((result) => new CampaignProfilesCollectionParticipantSummary(result));
  }
};

module.exports = CampaignProfilesCollectionParticipantSummaryRepository;
