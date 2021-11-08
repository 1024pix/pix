const { knex } = require('../bookshelf');
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');

const TABLE_NAME = 'badge-criteria';

module.exports = {
  async save({ badgeCriterion }) {
    const savedBadgeCriterion = await knex(TABLE_NAME).insert(badgeCriterion).returning('*');
    return new BadgeCriterion(savedBadgeCriterion[0]);
  },
};
