exports.up = function(knex) {
  return knex.schema.table('knowledge-elements', (table) => {
    table.dropColumn('id');
  });
};

exports.down = function() {
};
