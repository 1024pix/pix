const TABLE = 'users';
const COLUMN_PET = 'pet';

const up = async function (knex) {
  await knex.schema.table(TABLE, function (table) {
    table.string(COLUMN_PET);
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE, function (table) {
    table.dropColumn(COLUMN_PET);
  });
};

export { up, down };
