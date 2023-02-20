const TABLE_NAME = 'complementary-certification-badges';
const { PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3 } = require('../constants').badges.keys;

export const up = async function (knex) {
  await knex(TABLE_NAME)
    .update({ level: 2 })
    .where({ badgeId: knex('badges').select('id').where({ key: PIX_EMPLOI_CLEA_V2 }) });
  await knex(TABLE_NAME)
    .update({ level: 3 })
    .where({ badgeId: knex('badges').select('id').where({ key: PIX_EMPLOI_CLEA_V3 }) });
};

export const down = async function (knex) {
  await knex(TABLE_NAME)
    .update({ level: 1 })
    .where({ badgeId: knex('badges').select('id').where({ key: PIX_EMPLOI_CLEA_V2 }) });
  await knex(TABLE_NAME)
    .update({ level: 1 })
    .where({ badgeId: knex('badges').select('id').where({ key: PIX_EMPLOI_CLEA_V3 }) });
};
