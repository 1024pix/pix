const { knex } = require('../../../db/knex-database-connection');

const copyIntIdToBigintId = async ({ startAt, endAt }) => {
  await knex
    .from('knowledge-elements')
    .whereBetween('id', [startAt, endAt])
    .update({ answer_bigintId: knex.ref('answerId') });
};

module.exports = {
  copyIntIdToBigintId,
};
