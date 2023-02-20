const ORGANIZATION_ROLES_TABLE = 'organization-roles';
const ORGANIZATIONS_ACCESSES_TABLE = 'organizations-accesses';

export const up = (knex) => {
  return knex.schema
    .createTable(ORGANIZATION_ROLES_TABLE, (table) => {
      table.increments('id').primary();
      table.string('name');
    })
    .then(() => {
      return knex.schema.createTable(ORGANIZATIONS_ACCESSES_TABLE, (table) => {
        table.increments('id').primary();
        table.bigInteger('userId').references('users.id').index();
        table.bigInteger('organizationId').references('organizations.id').index();
      });
    })
    .then(() => {
      const roles = [{ name: 'ADMIN' }];

      return knex.batchInsert(ORGANIZATION_ROLES_TABLE, roles);
    });
};

export const down = (knex) => {
  return knex.schema.dropTable(ORGANIZATIONS_ACCESSES_TABLE).then(() => {
    return knex.schema.dropTable(ORGANIZATION_ROLES_TABLE);
  });
};
