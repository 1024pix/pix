const { knex } = require('../bookshelf');

module.exports = {
  async create({ sessionId, userId }) {
    await knex('supervisor-accesses').insert({ sessionId, userId });
  },
};
