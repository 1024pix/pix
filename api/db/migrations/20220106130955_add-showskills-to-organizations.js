const TABLE_NAME = 'organizations';
const COLUMN_NAME = 'showSkills';

const up = async function(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(COLUMN_NAME).notNullable().defaultTo(false);
  });
  await knex(TABLE_NAME).whereIn('type', ['SUP', 'PRO']).update({ showSkills: true });
};

const down = async function(knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
