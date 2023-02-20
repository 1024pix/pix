import targetProfileForUpdate from '../../domain/models/TargetProfileForUpdate';
import { knex } from '../../../db/knex-database-connection';
import { NotFoundError } from '../../domain/errors';

export default {
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
