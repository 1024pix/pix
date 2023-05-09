const TABLE_NAME = 'sessions';
const COLUMN_NAME = 'assignedCertificationOfficerId';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).references('users.id');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
