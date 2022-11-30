const { knex } = require('../../../db/knex-database-connection');
const BadgeCriterion = require('../../../lib/domain/models/BadgeCriterion');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

const TABLE_NAME = 'badge-criteria';

module.exports = {
  async save({ badgeCriterion }, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const data = {
      ...badgeCriterion,
      // WORKAROUND: jsonb array needs to be stringified see https://knexjs.org/guide/schema-builder.html#json
      cappedTubes: badgeCriterion.cappedTubes ? JSON.stringify(badgeCriterion.cappedTubes) : null,
    };
    const savedBadgeCriterion = await (knexTransaction ?? knex)(TABLE_NAME).insert(data).returning('*');
    return new BadgeCriterion(savedBadgeCriterion[0]);
  },
};
