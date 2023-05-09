import { knex } from '../../../db/knex-database-connection.js';
import { ParticipationForCampaignManagement } from '../../domain/models/ParticipationForCampaignManagement.js';
import { fetchPage } from '../utils/knex-utils.js';
import { NotFoundError } from '../../domain/errors.js';

const findPaginatedParticipationsForCampaignManagement = async function ({ campaignId, page }) {
  const query = knex('campaign-participations')
    .select({
      id: 'campaign-participations.id',
      lastName: 'organization-learners.lastName',
      firstName: 'organization-learners.firstName',
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
    .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
    .leftJoin('users as deletedByUsers', 'deletedByUsers.id', 'campaign-participations.deletedBy')
    .innerJoin('users', 'users.id', 'campaign-participations.userId')
    .where('campaignId', campaignId)
    .orderBy(['lastName', 'firstName'], ['asc', 'asc']);

  const { results, pagination } = await fetchPage(query, page);

  const participationsForCampaignManagement = results.map(
    (attributes) => new ParticipationForCampaignManagement(attributes)
  );
  return { models: participationsForCampaignManagement, meta: { ...pagination } };
};

const updateParticipantExternalId = async function ({ campaignParticipationId, participantExternalId }) {
  const updatedRows = await knex('campaign-participations')
    .where('id', campaignParticipationId)
    .update({ participantExternalId });

  if (!updatedRows) {
    throw new NotFoundError(`La participation avec l'id ${campaignParticipationId} n'existe pas.`);
  }
};

export { findPaginatedParticipationsForCampaignManagement, updateParticipantExternalId };
