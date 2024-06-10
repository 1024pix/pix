import { knex } from '../../../../../db/knex-database-connection.js';
import { CampaignParticipationForUserManagement } from '../../domain/models/CampaignParticipationForUserManagement.js';

const findByUserId = async function (userId) {
  const campaignParticipations = await knex('campaign-participations')
    .select({
      id: 'campaign-participations.id',
      participantExternalId: 'campaign-participations.participantExternalId',
      status: 'campaign-participations.status',
      campaignId: 'campaigns.id',
      campaignCode: 'campaigns.code',
      createdAt: 'campaign-participations.createdAt',
      sharedAt: 'campaign-participations.sharedAt',
      deletedAt: 'campaign-participations.deletedAt',
      deletedBy: 'deletedByUsers.id',
      deletedByFirstName: 'deletedByUsers.firstName',
      deletedByLastName: 'deletedByUsers.lastName',
      organizationLearnerFirstName: 'view-active-organization-learners.firstName',
      organizationLearnerLastName: 'view-active-organization-learners.lastName',
    })
    .innerJoin('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .innerJoin(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .leftJoin('users as deletedByUsers', 'deletedByUsers.id', 'campaign-participations.deletedBy')
    .where('campaign-participations.userId', userId)
    .orderBy('campaignCode', 'asc')
    .orderBy('sharedAt', 'desc');

  return campaignParticipations.map((attributes) => new CampaignParticipationForUserManagement(attributes));
};

export { findByUserId };
