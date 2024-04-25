import { knex } from '../../../db/knex-database-connection.js';
import { BadRequestError } from '../../application/http-errors.js';
import { TargetProfileForCreation } from '../../domain/models/TargetProfileForCreation.js';

const TABLE_NAME = 'target-profiles';

const update = async function ({
  targetProfileId,
  name,
  imageUrl,
  description,
  comment,
  category,
  areKnowledgeElementsResettable,
}) {
  const targetProfileToUpdate = {
    name,
    imageUrl,
    description,
    comment,
    category,
    areKnowledgeElementsResettable,
  };
  return knex(TABLE_NAME).where({ id: targetProfileId }).update(targetProfileToUpdate);
};

const updateWithTubes = async function (targetProfileId, attributesToUpdate) {
  if (Object.keys(attributesToUpdate).length === 0) {
    throw new BadRequestError("Erreur, aucune propriété n'est à mettre à jour");
  }

  const { tubes, ...otherAttributes } = attributesToUpdate;

  const [updatedTargetProfile] = await knex(TABLE_NAME)
    .where({ id: targetProfileId })
    .update(otherAttributes)
    .returning('*');

  const tubesData = tubes.map((tube) => ({
    targetProfileId,
    tubeId: tube.id,
    level: tube.level,
  }));

  // Delete useless existing target profile tubes
  await knex('target-profile_tubes').delete().where({ targetProfileId });
  // Create or update target profile tubes
  await knex('target-profile_tubes').insert(tubesData);

  return new TargetProfileForCreation(updatedTargetProfile);
};

export { update, updateWithTubes };
