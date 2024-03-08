const TABLE_NAME = 'organization-imports';
const COLUMN_NAME = 'filename';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.text(COLUMN_NAME).nullable().defaultTo(null).alter();
  });
};

const down = async function () {
  // No existing data at this stage
};

export { down, up };
