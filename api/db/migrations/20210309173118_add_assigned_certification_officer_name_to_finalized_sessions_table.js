const TABLE_NAME = 'finalized-sessions';
const COLUMN_NAME = 'assignedCertificationOfficerName';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};
