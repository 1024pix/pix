import { knex } from '../../../../../db/knex-database-connection.js';
import { Group } from '../../domain/models/Group.js';

async function findByCampaignId(campaignId) {
  const groups = await knex('view-active-organization-learners')
    .where({ campaignId })
    .where({ 'campaign-participations.deletedAt': null })
    .distinct('group')
    .whereNotNull('group')
    .orderBy('group', 'asc')
    .join(
      'campaign-participations',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    );

  return groups.map(({ group }) => _toDomain(group));
}

async function findByOrganizationId({ organizationId }) {
  const groupRows = await knex('view-active-organization-learners')
    .distinct('group')
    .where({ organizationId, isDisabled: false })
    .whereNotNull('group')
    .orderBy('group', 'asc');

  return groupRows.map(({ group }) => _toDomain(group));
}

function _toDomain(group) {
  return new Group({ name: group });
}

export { findByCampaignId, findByOrganizationId };
