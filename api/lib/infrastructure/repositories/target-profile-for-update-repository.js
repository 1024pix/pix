import { knex } from '../../../db/knex-database-connection.js';

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
  return knex('target-profiles').where({ id: targetProfileId }).update(targetProfileToUpdate);
};

export { update };
