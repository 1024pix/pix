const { knex } = require('../../../db/knex-database-connection');
const UserLogin = require('../../domain/models/UserLogin');

module.exports = {
  async findByUserId(userId) {
    const foundUserLogin = await knex.from('user-logins').where({ userId }).first();
    return foundUserLogin ? new UserLogin(foundUserLogin) : null;
  },
};
