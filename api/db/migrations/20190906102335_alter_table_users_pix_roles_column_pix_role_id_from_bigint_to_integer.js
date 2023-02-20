const TABLE_NAME = 'users_pix_roles';

export const up = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('pix_role_id').unsigned().alter();
  });
};

export const down = (knex) => {
  return knex.schema.alterTable(TABLE_NAME, function (table) {
    table.bigInteger('pix_role_id').alter();
  });
};
