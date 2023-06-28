import { knex } from '../../../../db/knex-database-connection.js';

const update = async function ({ targetProfileId, name, imageUrl, description, comment, category }) {
  const targetProfileToUpdate = {
    name,
    imageUrl,
    description,
    comment,
    category,
  };
  return knex('target-profiles').where({ id: targetProfileId }).update(targetProfileToUpdate);
};

export { update };
