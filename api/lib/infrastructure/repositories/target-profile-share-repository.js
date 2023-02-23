const { knex } = require('../../../db/knex-database-connection.js');
const DomainTransaction = require('../DomainTransaction.js');

module.exports = {
  async addTargetProfilesToOrganization({ organizationId, targetProfileIdList }) {
    const targetProfileShareToAdd = targetProfileIdList.map((targetProfileId) => {
      return { organizationId, targetProfileId };
    });
    await knex('target-profile-shares')
      .insert(targetProfileShareToAdd)
      .onConflict(['targetProfileId', 'organizationId'])
      .ignore();
  },

  async batchAddTargetProfilesToOrganization(
    organizationTargetProfiles,
    domainTransaction = DomainTransaction.emptyTransaction()
  ) {
    await knex
      .batchInsert('target-profile-shares', organizationTargetProfiles)
      .transacting(domainTransaction.knexTransaction);
  },
};
