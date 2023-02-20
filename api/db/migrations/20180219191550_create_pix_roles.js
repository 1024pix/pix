export const up = (knex) => {
  return knex.schema
    .createTable('pix_roles', (table) => {
      table.increments('id').primary();
      table.string('name');
    })
    .then(() => {
      return knex.schema.createTable('users_pix_roles', (table) => {
        table.increments('id').primary();
        table.bigInteger('user_id').references('users.id');
        table.bigInteger('pix_role_id').references('pix_roles.id');
      });
    })
    .then(() => {
      const roles = [{ name: 'PIX_MASTER' }, { name: 'PIX_READER' }];

      return knex.batchInsert('pix_roles', roles);
    });
};

export const down = (knex) => {
  return knex.schema.dropTable('pix_roles').then(() => {
    return knex.schema.dropTable('users_pix_roles');
  });
};
