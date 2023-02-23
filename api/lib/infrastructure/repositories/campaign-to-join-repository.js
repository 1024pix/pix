const { knex } = require('../../../db/knex-database-connection.js');
const CampaignToJoin = require('../../domain/read-models/CampaignToJoin.js');
const { NotFoundError } = require('../../domain/errors.js');
const DomainTransaction = require('../DomainTransaction.js');

module.exports = {
  async get(id, domainTransaction = DomainTransaction.emptyTransaction()) {
    const knexConn = domainTransaction.knexTransaction || knex;
    const result = await knexConn('campaigns')
      .select('campaigns.*')
      .select({
        organizationId: 'organizations.id',
        organizationName: 'organizations.name',
        organizationType: 'organizations.type',
        organizationLogoUrl: 'organizations.logoUrl',
        organizationIsManagingStudents: 'organizations.isManagingStudents',
        organizationShowNPS: 'organizations.showNPS',
        organizationFormNPSUrl: 'organizations.formNPSUrl',
        targetProfileName: 'target-profiles.name',
        targetProfileImageUrl: 'target-profiles.imageUrl',
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
        organizationId: 'organizations.id',
        organizationName: 'organizations.name',
        organizationType: 'organizations.type',
        organizationLogoUrl: 'organizations.logoUrl',
        organizationIsManagingStudents: 'organizations.isManagingStudents',
        organizationShowNPS: 'organizations.showNPS',
        organizationFormNPSUrl: 'organizations.formNPSUrl',
        targetProfileName: 'target-profiles.name',
        targetProfileImageUrl: 'target-profiles.imageUrl',
        targetProfileIsSimplifiedAccess: 'target-profiles.isSimplifiedAccess',
        identityProvider: 'organizations.identityProviderForCampaigns',
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
};
