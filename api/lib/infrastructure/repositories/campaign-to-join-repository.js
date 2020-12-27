const { knex } = require('../bookshelf');
const CampaignToJoin = require('../../domain/models/CampaignToJoin');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  async get(id) {
    const result = await knex('campaigns')
      .select('campaigns.*')
      .select({
        'organizationId': 'organizations.id',
        'organizationName': 'organizations.name',
        'organizationType': 'organizations.type',
        'organizationIsManagingStudents': 'organizations.isManagingStudents',
        'targetProfileId': 'target-profiles.id',
        'targetProfileName': 'target-profiles.name',
      })
      .join('organizations', 'organizations.id', 'campaigns.organizationId')
      .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
      .where('campaigns.id', id)
      .first();

    if (!result) {
      throw new NotFoundError(`La campagne d'id ${id} n'existe pas ou son accès est restreint`);
    }

    return new CampaignToJoin(result);
  },

  async getByCode(code) {
    const result = await knex('campaigns')
      .select('campaigns.*')
      .select({
        'organizationId': 'organizations.id',
        'organizationName': 'organizations.name',
        'organizationType': 'organizations.type',
        'organizationIsManagingStudents': 'organizations.isManagingStudents',
        'targetProfileId': 'target-profiles.id',
        'targetProfileName': 'target-profiles.name',
      })
      .join('organizations', 'organizations.id', 'campaigns.organizationId')
      .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
      .where('campaigns.code', code)
      .first();

    if (!result) {
      throw new NotFoundError(`La campagne au code ${code} n'existe pas ou son accès est restreint`);
    }

    return new CampaignToJoin(result);
  },

  async isCampaignJoinableByUser(campaign, userId) {
    if (campaign.isArchived) {
      return false;
    }

    if (campaign.isRestricted) {
      const result = await knex
        .select('schooling-registrations.id')
        .from('schooling-registrations')
        .where({ userId, organizationId: campaign.organizationId })
        .first();

      if (!result) {
        return false;
      }
    }

    return true;
  },
};
