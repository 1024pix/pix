const targetProfileForUpdate = require('../../domain/models/TargetProfileForUpdate.js');
const { knex } = require('../../../db/knex-database-connection.js');
const { NotFoundError } = require('../../domain/errors.js');

module.exports = {
  async get(id) {
    const row = await knex('target-profiles')
      .select('id', 'name', 'description', 'comment', 'category')
      .where({ id })
      .first();

    if (!row) {
      throw new NotFoundError(`Le profil cible avec l'id ${id} n'existe pas`);
    }

    return new targetProfileForUpdate(row);
  },

  async update(targetProfile) {
    return await knex('target-profiles').where({ id: targetProfile.id }).update(targetProfile);
  },
};
