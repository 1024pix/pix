const { knex } = require('../../../../db/knex-database-connection');
const User = require('../../domain/models/User');
const { UserNotFoundError } = require('../../../domain/errors');
module.exports = {
  async getByEmail(email) {
    const row = await knex('users')
      .select(`pix-admin-roles.id`, 'users.id as userId', 'firstName', 'lastName', 'email', 'role', 'disabledAt')
      .from('users')
      .where({ email })
      .leftJoin('pix-admin-roles', 'users.id', `pix-admin-roles.userId`)
      .first();

    if (!row) {
      throw new UserNotFoundError(`User not found for email ${email}`);
    }

    return new User(row);
  },

  async save(user) {
    const [id] = await knex('pix-admin-roles')
      .insert({ userId: user.userId, role: user.role, disabledAt: user.disabledAt })
      .onConflict('userId')
      .merge()
      .returning('id');

    user.id = id;
  },
};
