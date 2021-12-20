const { knex } = require('../bookshelf');

module.exports = {
  async create({ sessionId, userId }) {
    await knex('supervisor-accesses').insert({ sessionId, userId });
  },

  async isUserSupervisorForSession({ sessionId, userId }) {
    const result = await knex.select(1).from('supervisor-accesses').where({ sessionId, userId }).first();
    return Boolean(result);
  },
};
