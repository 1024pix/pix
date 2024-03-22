const TABLE_NAME = 'competence-scoring-configurations';
const COLUMN_NAME = 'createdByUserId';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.bigInteger(COLUMN_NAME).defaultTo(null).references('users.id');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
