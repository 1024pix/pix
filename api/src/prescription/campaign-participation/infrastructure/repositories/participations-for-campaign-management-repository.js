import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';

const updateParticipantExternalId = async function ({ campaignParticipationId, participantExternalId }) {
  const updatedRows = await knex('campaign-participations')
    .where('id', campaignParticipationId)
    .update({ participantExternalId });

  if (!updatedRows) {
    throw new NotFoundError(`La participation avec l'id ${campaignParticipationId} n'existe pas.`);
  }
};

export { updateParticipantExternalId };
