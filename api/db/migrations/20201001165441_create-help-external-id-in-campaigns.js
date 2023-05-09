const TABLE_NAME = 'campaigns';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text('externalIdHelpImageUrl');
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('externalIdHelpImageUrl');
  });
};

export { up, down };
