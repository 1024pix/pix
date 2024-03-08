const TABLE_COMPLEMENTARY_CERTIFICATIONS = 'complementary-certifications';
const COLUMN_KEY = 'key';
const COLUMN_CERTIFICATION_EXTRATIME = 'certificationExtraTime';
const VALUE_PIXPLUS_KEYS = ['DROIT', 'EDU_1ER_DEGRE', 'EDU_2ND_DEGRE'];
const VALUE_PIX_PLUS_EXTRATIME_MINUTES = 45;

const up = async function (knex) {
  await knex.schema.table(TABLE_COMPLEMENTARY_CERTIFICATIONS, function (table) {
    table.integer(COLUMN_CERTIFICATION_EXTRATIME).defaultTo(0).notNullable();
  });

  await knex(TABLE_COMPLEMENTARY_CERTIFICATIONS)
    .whereIn(COLUMN_KEY, VALUE_PIXPLUS_KEYS)
    .update({ [COLUMN_CERTIFICATION_EXTRATIME]: VALUE_PIX_PLUS_EXTRATIME_MINUTES });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_COMPLEMENTARY_CERTIFICATIONS, function (table) {
    table.dropColumn(COLUMN_CERTIFICATION_EXTRATIME);
  });
};

export { down, up };
