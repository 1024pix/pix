const TABLE_NAME = 'granted-accreditations';

export const up = (knex) => {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.integer('accreditationId').references('accreditations.id').notNullable();
    t.integer('certificationCenterId').references('certification-centers.id').notNullable();
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
