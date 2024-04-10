import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { ParticipationForCampaignManagement } from '../../domain/models/ParticipationForCampaignManagement.js';

const updateParticipantExternalId = async function ({ campaignParticipationId, participantExternalId }) {
  const updatedRows = await knex('campaign-participations')
    .where('id', campaignParticipationId)
    .update({ participantExternalId });

  if (!updatedRows) {
    throw new NotFoundError(`La participation avec l'id ${campaignParticipationId} n'existe pas.`);
  }
};

const findPaginatedParticipationsForCampaignManagement = async function ({ campaignId, page }) {
  const query = knex('campaign-participations')
    .select({
      id: 'campaign-participations.id',
      lastName: 'view-active-organization-learners.lastName',
      firstName: 'view-active-organization-learners.firstName',
      userId: 'users.id',
      userFirstName: 'users.firstName',
      userLastName: 'users.lastName',
      participantExternalId: 'campaign-participations.participantExternalId',
      status: 'campaign-participations.status',
      createdAt: 'campaign-participations.createdAt',
      sharedAt: 'campaign-participations.sharedAt',
      deletedAt: 'campaign-participations.deletedAt',
      deletedBy: 'deletedByUsers.id',
      deletedByFirstName: 'deletedByUsers.firstName',
      deletedByLastName: 'deletedByUsers.lastName',
    })
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .leftJoin('users as deletedByUsers', 'deletedByUsers.id', 'campaign-participations.deletedBy')
    .innerJoin('users', 'users.id', 'campaign-participations.userId')
    .where('campaignId', campaignId)
    .orderBy(['lastName', 'firstName'], ['asc', 'asc']);

  const { results, pagination } = await fetchPage(query, page);

  const participationsForCampaignManagement = results.map(
    (attributes) => new ParticipationForCampaignManagement(attributes),
  );
  return { models: participationsForCampaignManagement, meta: { ...pagination } };
};

export { findPaginatedParticipationsForCampaignManagement, updateParticipantExternalId };
