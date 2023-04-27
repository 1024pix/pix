const { knex } = require('../../../db/knex-database-connection.js');

module.exports = {
  async update({ targetProfileId, name, imageUrl, description, comment, category }) {
    const targetProfileToUpdate = {
      name,
      imageUrl,
      description,
      comment,
      category,
    };
    return knex('target-profiles').where({ id: targetProfileId }).update(targetProfileToUpdate);
  },
};
