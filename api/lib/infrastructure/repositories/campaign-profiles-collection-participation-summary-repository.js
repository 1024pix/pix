const { knex } = require('../bookshelf');
const CampaignProfilesCollectionParticipationSummary = require('../../domain/models/CampaignProfilesCollectionParticipationSummary');
const { fetchPage } = require('../utils/knex-utils');

const CampaignProfilesCollectionParticipationSummaryRepository = {

  async findPaginatedByCampaignId(campaignId, page) {
    const query = knex
      .select(
        'campaign-participations.id AS campaignParticipationId',
        'users.firstName',
        'users.lastName',
        'campaign-participations.participantExternalId',
        'campaign-participations.sharedAt',
      )
      .from('campaign-participations')
      .join('users', 'users.id', 'campaign-participations.userId')
      .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
      .where('campaign-participations.campaignId', '=', campaignId)
      .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);

    const { results, pagination } = await fetchPage(query, page);

    const data = results.map(
      (result) => new CampaignProfilesCollectionParticipationSummary(result)
    );

    return { data, pagination };
  }

};

module.exports = CampaignProfilesCollectionParticipationSummaryRepository;
