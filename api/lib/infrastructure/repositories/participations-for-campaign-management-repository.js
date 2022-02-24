const { knex } = require('../bookshelf');
const ParticipationForCampaignManagement = require('../../domain/models/ParticipationForCampaignManagement');
const { fetchPage } = require('../utils/knex-utils');

module.exports = {
  async findPaginatedParticipationsForCampaignManagement({ campaignId, page }) {
    const query = knex('campaign-participations')
      .select({
        id: 'campaign-participations.id',
        lastName: 'schooling-registrations.lastName',
        firstName: 'schooling-registrations.firstName',
        participantExternalId: 'campaign-participations.participantExternalId',
        status: 'campaign-participations.status',
        createdAt: 'campaign-participations.createdAt',
        sharedAt: 'campaign-participations.sharedAt',
      })
      .join('schooling-registrations', 'schooling-registrations.id', 'campaign-participations.schoolingRegistrationId')
      .where('campaignId', campaignId)
      .orderBy(['lastName', 'firstName'], ['asc', 'asc']);

    const { results, pagination } = await fetchPage(query, page);

    const participationsForCampaignManagement = results.map(
      (attributes) => new ParticipationForCampaignManagement(attributes)
    );
    return { models: participationsForCampaignManagement, meta: { ...pagination } };
  },
};
