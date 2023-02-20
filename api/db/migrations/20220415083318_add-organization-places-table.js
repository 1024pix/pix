const TABLE_NAME = 'organization-places';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('count');
    t.integer('organizationId').index().references('organizations.id').notNullable();
    t.dateTime('activationDate').notNullable();
    t.dateTime('expiredDate').nullable();
    t.text('reference').notNullable();
    t.text('category').notNullable();
    t.integer('createdBy').references('users.id').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
