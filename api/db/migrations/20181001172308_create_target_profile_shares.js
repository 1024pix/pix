const TABLE_NAME = 'target-profile-shares';

const up = function(knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('targetProfileId').unsigned().references('target-profiles.id').index();
    t.integer('organizationId').unsigned().references('organizations.id').index();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

const down = function(knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
