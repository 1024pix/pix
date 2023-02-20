const TABLE_NAME = 'accredited-badges';

export const up = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};

export const down = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('accreditationId').references('accreditations.id').notNullable();
    t.integer('badgeId').references('badges.id').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};
