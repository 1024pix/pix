const targetProfileForUpdate = require('../../domain/models/TargetProfileForUpdate');
const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');

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
