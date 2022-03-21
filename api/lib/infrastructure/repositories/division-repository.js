const Division = require('../../domain/models/Division');
const { knex } = require('../bookshelf');

async function findByCampaignId(campaignId) {
  const divisions = await knex('campaigns')
    .where({ 'campaigns.id ': campaignId })
    .select('division')
    .groupBy('division')
    .join('campaign-participations', 'campaigns.id', 'campaign-participations.campaignId')
    .innerJoin('organization-learners', function () {
      this.on('organization-learners.userId', '=', 'campaign-participations.userId').andOn(
        'organization-learners.organizationId',
        '=',
        'campaigns.organizationId'
      );
    });

  return divisions.map(({ division }) => _toDomain(division));
}

async function findByOrganizationIdForCurrentSchoolYear({ organizationId }) {
  const divisionRows = await knex('organization-learners')
    .distinct('division')
    .where({ organizationId, isDisabled: false })
    .whereNotNull('division')
    .orderBy('division', 'asc');

  return divisionRows.map(({ division }) => _toDomain(division));
}

function _toDomain(division) {
  return new Division({ name: division });
}

module.exports = {
  findByCampaignId,
  findByOrganizationIdForCurrentSchoolYear,
};
