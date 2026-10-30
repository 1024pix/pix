const TABLE_NAME = 'combined_course_blueprints';
const COLUMN_NAME = 'durationType';

const up = async (knex) => {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME).defaultTo(null).comment('Estimated duration to complete the combined course');
  });
};

const down = async (knex) => {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
