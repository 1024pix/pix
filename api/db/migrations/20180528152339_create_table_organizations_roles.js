exports.up = (knex) => {

  return knex.schema
    .createTable('organization-roles', (table) => {
      table.increments('id').primary();
      table.string('name');
    })
    .then(() => {
      return knex.schema.createTable('organizations-accesses', (table) => {
        table.increments('id').primary();
        table.bigInteger('userId').references('users.id');
        table.bigInteger('organizationRoleId').references('organization-roles.id');
        table.bigInteger('organizationId').references('organizations.id');
      });
    })
    .then(() => {
      const roles = [
        { name: 'ADMIN' }
      ];

      return knex.batchInsert('organization-roles', roles);
    });
};

exports.down = (knex) => {
  return knex.schema.dropTable('organization-roles').then(() => {
    return knex.schema.dropTable('organizations-accesses');
  });
};
