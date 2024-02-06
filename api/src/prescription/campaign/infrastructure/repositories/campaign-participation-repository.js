import { knex } from '../../../../../db/knex-database-connection.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';

const findProfilesCollectionResultDataByCampaignId = async function (campaignId) {
  const results = await knex('campaign-participations')
    .select([
      'campaign-participations.*',
      'view-active-organization-learners.studentNumber',
      'view-active-organization-learners.division',
      'view-active-organization-learners.group',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
    ])
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .where({ campaignId, 'campaign-participations.deletedAt': null })
    .orderBy('lastName', 'ASC')
    .orderBy('firstName', 'ASC')
    .orderBy('createdAt', 'DESC');

  return results.map(_rowToResult);
};

export { findProfilesCollectionResultDataByCampaignId };

function _rowToResult(row) {
  return {
    id: row.id,
    createdAt: new Date(row.createdAt),
    isShared: row.status === CampaignParticipationStatuses.SHARED,
    sharedAt: row.sharedAt ? new Date(row.sharedAt) : null,
    participantExternalId: row.participantExternalId,
    userId: row.userId,
    isCompleted: row.state === 'completed',
    studentNumber: row.studentNumber,
    participantFirstName: row.firstName,
    participantLastName: row.lastName,
    division: row.division,
    pixScore: row.pixScore,
    group: row.group,
  };
}
