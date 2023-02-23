const { knex } = require('../../../db/knex-database-connection.js');
const DomainTransaction = require('../../infrastructure/DomainTransaction.js');
const SkillSet = require('../../../lib/domain/models/SkillSet.js');

const TABLE_NAME = 'skill-sets';

module.exports = {
  async save({ skillSet }, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const savedSkillSet = await (knexTransaction ?? knex)(TABLE_NAME).insert(skillSet).returning('*');
    return new SkillSet(savedSkillSet[0]);
  },
};
