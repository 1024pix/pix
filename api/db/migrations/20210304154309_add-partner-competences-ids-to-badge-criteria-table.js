const TABLE_NAME = 'badge-criteria';
const NEW_COLUMN = 'partnerCompetenceIds';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.specificType(NEW_COLUMN, 'int[]');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(NEW_COLUMN);
  });
};

export { up, down };
