const TABLE_NAME = 'snapshots';

export const up = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export const down = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('studentCode');
    t.string('campaignCode');
    t.integer('organizationId').unsigned().references('organizations.id');
    t.integer('userId').unsigned().references('users.id');
    t.string('score');
    t.json('profile').notNullable();
    t.integer('testsFinished');
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};
