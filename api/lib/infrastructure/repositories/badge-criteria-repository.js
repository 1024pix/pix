const { knex } = require('../../../db/knex-database-connection');
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

const TABLE_NAME = 'badge-criteria';

module.exports = {
  async save({ badgeCriterion }, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const savedBadgeCriterion = await (knexTransaction ?? knex)(TABLE_NAME).insert(badgeCriterion).returning('*');
    return new BadgeCriterion(savedBadgeCriterion[0]);
  },
};
