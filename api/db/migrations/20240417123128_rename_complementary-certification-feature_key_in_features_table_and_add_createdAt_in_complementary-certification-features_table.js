const TABLE_FEATURES_NAME = 'features';
const TABLE_CERTIFICATION_CENTER_FEATURES_NAME = 'certification-center-features';
const COLUMN_KEY_NAME = 'key';
const COLUMN_CREATED_AT_NAME = 'createdAt';

const up = async function (knex) {
  await knex(TABLE_FEATURES_NAME)
    .where(COLUMN_KEY_NAME, 'CAN_REGISTER_FOR_A_SINGLE_COMPLEMENTARY_ALONE')
    .update(COLUMN_KEY_NAME, 'CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE');

  await knex.schema.table(TABLE_CERTIFICATION_CENTER_FEATURES_NAME, function (table) {
    table.date(COLUMN_CREATED_AT_NAME).notNullable().defaultTo(knex.fn.now());
  });
};

const down = async function (knex) {
  await knex(TABLE_FEATURES_NAME)
    .where(COLUMN_KEY_NAME, 'CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE')
    .update(COLUMN_KEY_NAME, 'CAN_REGISTER_FOR_A_SINGLE_COMPLEMENTARY_ALONE');

  await knex.schema.table(TABLE_CERTIFICATION_CENTER_FEATURES_NAME, (table) => {
    table.dropColumn(COLUMN_CREATED_AT_NAME);
  });
};

export { down, up };
