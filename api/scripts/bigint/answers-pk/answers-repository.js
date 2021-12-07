const { knex } = require('../../../db/knex-database-connection');

const copyIntIdToBigintId = async ({ startAt, endAt }) => {
  await knex('answers')
    .whereBetween('id', [startAt, endAt])
    .update({ bigintId: knex.ref('id') });
};

module.exports = {
  copyIntIdToBigintId,
};
