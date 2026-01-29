import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { ParticipationForCampaignManagement } from '../../domain/models/ParticipationForCampaignManagement.js';

const updateParticipantExternalId = async function ({ campaignParticipationId, participantExternalId }) {
  const knexConn = DomainTransaction.getConnection();
  const updatedRows = await knexConn('campaign-participations')
    .where('id', campaignParticipationId)
    .update({ participantExternalId });

  if (!updatedRows) {
    throw new NotFoundError(`La participation avec l'id ${campaignParticipationId} n'existe pas.`);
  }
};

const findPaginatedParticipationsForCampaignManagement = async function ({ campaignId, page }) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn('campaign-participations')
    .select({
      id: 'campaign-participations.id',
      lastName: 'view-active-organization-learners.lastName',
      firstName: 'view-active-organization-learners.firstName',
      userId: 'users.id',
      userFirstName: 'users.firstName',
      userLastName: 'users.lastName',
      participantExternalId: 'campaign-participations.participantExternalId',
      status: knex.raw(
        `CASE WHEN "campaign-participations"."status" = 'TO_SHARE' THEN 'STARTED' ELSE "campaign-participations"."status" END`, // TODO: stop casting TO_SHARE once the migration is done
      ),
      createdAt: 'campaign-participations.createdAt',
      sharedAt: 'campaign-participations.sharedAt',
      deletedAt: 'campaign-participations.deletedAt',
      deletedBy: 'deletedByUsers.id',
      deletedByFirstName: 'deletedByUsers.firstName',
      deletedByLastName: 'deletedByUsers.lastName',
    })
    .leftJoin(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .leftJoin('users as deletedByUsers', 'deletedByUsers.id', 'campaign-participations.deletedBy')
    .leftJoin('users', 'users.id', 'campaign-participations.userId')
    .where('campaignId', campaignId)
    .orderBy(['lastName', 'firstName'], ['asc', 'asc']);

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });

  const participationsForCampaignManagement = results.map(
    (attributes) => new ParticipationForCampaignManagement(attributes),
  );
  return { models: participationsForCampaignManagement, meta: { ...pagination } };
};

export { findPaginatedParticipationsForCampaignManagement, updateParticipantExternalId };
