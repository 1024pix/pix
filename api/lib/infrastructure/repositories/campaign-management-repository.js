const { knex } = require('../bookshelf');

const CampaignManagement = require('../../domain/read-models/CampaignManagement');
const { fetchPage } = require('../utils/knex-utils');

module.exports = {

  async findPaginatedCampaignManagements({ organizationId, page }) {
    const query = knex('campaigns')
      .select({
        id: 'campaigns.id',
        code: 'campaigns.code',
        name: 'campaigns.name',
        createdAt: 'campaigns.createdAt',
        archivedAt: 'campaigns.archivedAt',
        type: 'campaigns.type',
        creatorLastName: 'users.lastName',
        creatorFirstName: 'users.firstName',
      })
      .join('users', 'users.id', 'campaigns.creatorId')
      .where('organizationId', organizationId)
      .orderBy('campaigns.createdAt', 'DESC');

    const { results, pagination } = await fetchPage(query, page);

    const campaignManagement = results.map((attributes) => new CampaignManagement(attributes));
    return { models: campaignManagement, meta: { ...pagination } };
  },
};
