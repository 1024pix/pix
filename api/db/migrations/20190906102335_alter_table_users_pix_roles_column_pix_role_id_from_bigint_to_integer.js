const TABLE_NAME = 'users_pix_roles';

const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('pix_role_id').unsigned().alter();
  });
};

const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.bigInteger('pix_role_id').alter();
  });
};

export { up, down };
