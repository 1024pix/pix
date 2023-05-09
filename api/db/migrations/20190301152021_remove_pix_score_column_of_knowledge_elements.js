const TABLE_NAME = 'knowledge-elements';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('pixScore');
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('pixScore');
  });
};

export { up, down };
