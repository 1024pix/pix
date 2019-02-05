const TABLE_NAME = 'knowledge-elements';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (t) => {
    t.float('pixValue').notNullable().defaultTo(0);
  }).then(() => {
    return knex.schema.table(TABLE_NAME, (table) => {
      table.dropColumn('pixScore');
    });
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (t) => {
    t.integer('pixScore').unsigned();
  }).then(() => {
    return knex.schema.table(TABLE_NAME, (t) => {
      t.dropColumn('pixValue');
    });
  });
};
