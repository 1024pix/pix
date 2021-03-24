const TABLE_NAME = 'users_pix_roles';

exports.up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.integer('user_id').unsigned().alter();
  });
};

exports.down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.bigInteger('user_id').alter();
  });
};
