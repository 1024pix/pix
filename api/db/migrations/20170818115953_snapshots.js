const TABLE_NAME = 'snapshots';

export const up = function (knex) {
  function table(t) {
    t.increments().primary();
    t.bigInteger('organizationId').unsigned().references('organizations.id');
    t.bigInteger('userId').unsigned().references('users.id');
    t.string('score');
    t.json('profile').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema.createTable(TABLE_NAME, table);
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
