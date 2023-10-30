const TABLE_NAME = 'autonomous-courses';

const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('organizationId').notNullable().unsigned().references('organizations.id');
    t.integer('targetProfileId').notNullable().unsigned().references('target-profiles.id');
    t.integer('campaignId').notNullable().unsigned().references('campaigns.id');
    t.string('publicTitle').notNullable();
    t.string('internalTitle').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
