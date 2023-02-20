const TABLE_NAME = 'certification-candidates';

export const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('firstName').notNullable();
    t.string('lastName').notNullable();
    t.string('birthplace').notNullable();
    t.string('externalId');
    t.date('birthdate').notNullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.integer('sessionId').references('sessions.id').notNull().index();
    t.decimal('extraTimePercentage', 3, 2);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable(TABLE_NAME);
};
