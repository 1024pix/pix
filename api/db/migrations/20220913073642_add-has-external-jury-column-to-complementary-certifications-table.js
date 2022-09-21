const TABLE_NAME = 'complementary-certifications';
const COLUMN_NAME = 'hasExternalJury';
const {
  PIX_PLUS_EDU_1ER_DEGRE,
  PIX_PLUS_EDU_2ND_DEGRE,
} = require('../../lib/domain/models/ComplementaryCertification');

exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).notNullable().default(false);
  });

  await knex(TABLE_NAME)
    .update({ hasExternalJury: true })
    .whereIn('key', [PIX_PLUS_EDU_1ER_DEGRE, PIX_PLUS_EDU_2ND_DEGRE]);
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => table.dropColumn(COLUMN_NAME));
};
