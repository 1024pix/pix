const Division = require('../../domain/models/Division');
const { knex } = require('../bookshelf');

async function findByCampaignId(campaignId) {
  const divisions = await knex('campaigns')
    .where({ 'campaigns.id ': campaignId })
    .select('division')
    .groupBy('division')
    .join('campaign-participations', 'campaigns.id', 'campaign-participations.campaignId')
    .innerJoin('schooling-registrations', function () {
      this.on('schooling-registrations.userId', '=', 'campaign-participations.userId').andOn(
        'schooling-registrations.organizationId',
        '=',
        'campaigns.organizationId'
      );
    });

  return divisions.map(({ division }) => _toDomain(division));
}

async function findByOrganizationIdForCurrentSchoolYear({ organizationId }) {
  const BEGINNING_OF_THE_2020_SCHOOL_YEAR = '2020-08-15';
  const divisionRows = await knex('schooling-registrations')
    .distinct('division')
    .where('organizationId', organizationId)
    .where('updatedAt', '>', BEGINNING_OF_THE_2020_SCHOOL_YEAR)
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
