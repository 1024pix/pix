const { knex } = require('../bookshelf');
const SkillSet = require('../../../lib/domain/models/SkillSet');

const TABLE_NAME = 'skill-sets';

module.exports = {
  async save({ skillSet }) {
    const savedSkillSet = await knex(TABLE_NAME).insert(skillSet).returning('*');
    return new SkillSet(savedSkillSet[0]);
  },
};
