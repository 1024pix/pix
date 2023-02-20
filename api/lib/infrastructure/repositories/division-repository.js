import Division from '../../domain/models/Division';
import { knex } from '../../../db/knex-database-connection';

async function findByCampaignId(campaignId) {
  const divisions = await knex('organization-learners')
    .where({ campaignId })
    .whereNotNull('division')
    .where({ 'campaign-participations.deletedAt': null })
    .distinct('division')
    .orderBy('division', 'asc')
    .join('campaign-participations', 'organization-learners.id', 'campaign-participations.organizationLearnerId');

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

export default {
  findByCampaignId,
  findByOrganizationIdForCurrentSchoolYear,
};
