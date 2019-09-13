const TABLE_NAME = 'users_pix_roles';

exports.up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function(table) {
    table.integer('pix_role_id').unsigned().alter();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function(table) {
    table.bigInteger('pix_role_id').alter();
  });
};
