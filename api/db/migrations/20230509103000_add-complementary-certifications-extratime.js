const TABLE_COMPLEMENTARY_CERTIFICATIONS = 'complementary-certifications';
const COLUMN_KEY = 'key';
const COLUMN_SESSION_EXTRATIME = 'sessionExtraTime';
const VALUE_PIXPLUS_KEYS = ['DROIT', 'EDU_1ER_DEGRE', 'EDU_2ND_DEGRE'];
const VALUE_PIXPLUS_EXTRATIME_MINUTES = 45;

exports.up = async function (knex) {
  await knex.schema.table(TABLE_COMPLEMENTARY_CERTIFICATIONS, function (table) {
    table.integer(COLUMN_SESSION_EXTRATIME).defaultTo(0).notNullable();
  });

  await knex(TABLE_COMPLEMENTARY_CERTIFICATIONS)
    .whereIn(COLUMN_KEY, VALUE_PIXPLUS_KEYS)
    .update({ [COLUMN_SESSION_EXTRATIME]: VALUE_PIXPLUS_EXTRATIME_MINUTES });
};

exports.down = async function (knex) {
  await knex.schema.table(TABLE_COMPLEMENTARY_CERTIFICATIONS, function (table) {
    table.dropColumn(COLUMN_SESSION_EXTRATIME);
  });
};
