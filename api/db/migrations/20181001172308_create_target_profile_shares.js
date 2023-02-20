const TABLE_NAME = 'target-profile-shares';

export const up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('targetProfileId').unsigned().references('target-profiles.id').index();
    t.integer('organizationId').unsigned().references('organizations.id').index();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
