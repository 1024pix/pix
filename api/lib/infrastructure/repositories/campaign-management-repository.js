const _ = require('lodash');
const { knex } = require('../bookshelf');
const CampaignManagement = require('../../domain/read-models/CampaignManagement');
const { fetchPage } = require('../utils/knex-utils');

module.exports = {
  async get(campaignId) {
    const result = await knex('campaigns')
      .select({
        id: 'campaigns.id',
        code: 'campaigns.code',
        name: 'campaigns.name',
        createdAt: 'campaigns.createdAt',
        archivedAt: 'campaigns.archivedAt',
        type: 'campaigns.type',
        creatorLastName: 'users.lastName',
        creatorFirstName: 'users.firstName',
        creatorId: 'users.id',
        organizationId: 'campaigns.organizationId',
        organizationName: 'organizations.name',
        targetProfileId: 'campaigns.targetProfileId',
        targetProfileName: 'target-profiles.name',
        title: 'campaigns.title',
        customLandingPageText: 'campaigns.customLandingPageText',
        customResultPageText: 'campaigns.customResultPageText',
        customResultPageButtonText: 'campaigns.customResultPageButtonText',
        customResultPageButtonUrl: 'campaigns.customResultPageButtonUrl',
      })
      .join('users', 'users.id', 'campaigns.creatorId')
      .join('organizations', 'organizations.id', 'campaigns.organizationId')
      .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
      .where('campaigns.id', campaignId)
      .first();
    return result;
  },

  async findPaginatedCampaignManagements({ organizationId, page }) {
    const query = knex('campaigns')
      .select({
        id: 'campaigns.id',
        code: 'campaigns.code',
        name: 'campaigns.name',
        createdAt: 'campaigns.createdAt',
        archivedAt: 'campaigns.archivedAt',
        type: 'campaigns.type',
        creatorLastName: 'creatorUser.lastName',
        creatorFirstName: 'creatorUser.firstName',
        creatorId: 'creatorUser.id',
        ownerId: 'ownerUser.id',
        ownerLastName: 'ownerUser.lastName',
        ownerFirstName: 'ownerUser.firstName',
      })
      .join('users AS creatorUser', 'creatorUser.id', 'campaigns.creatorId')
      .join('users AS ownerUser', 'ownerUser.id', 'campaigns.ownerId')
      .where('organizationId', organizationId)
      .orderBy('campaigns.createdAt', 'DESC');

    const { results, pagination } = await fetchPage(query, page);

    const campaignManagement = results.map((attributes) => new CampaignManagement(attributes));
    return { models: campaignManagement, meta: { ...pagination } };
  },

  update({ campaignId, campaignAttributes }) {
    const editableAttributes = _.pick(campaignAttributes, [
      'name',
      'title',
      'customLandingPageText',
      'customResultPageText',
      'customResultPageButtonText',
      'customResultPageButtonUrl',
    ]);
    return knex('campaigns').where({ id: campaignId }).update(editableAttributes);
  },
};
