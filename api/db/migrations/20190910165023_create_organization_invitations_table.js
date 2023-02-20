const TABLE_NAME = 'organization-invitations';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.integer('organizationId').unsigned().references('organizations.id').index();
    table.string('email').notNullable();
    table.string('status').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
