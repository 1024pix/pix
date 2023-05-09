const TABLE_NAME = 'accredited-badges';

const up = function(knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

const down = function(knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('accreditationId').references('accreditations.id').notNullable();
    t.integer('badgeId').references('badges.id').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
};

export { up, down };
