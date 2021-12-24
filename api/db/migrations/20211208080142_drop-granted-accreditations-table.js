const TABLE_NAME = 'granted-accreditations';

exports.up = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

exports.down = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.integer('accreditationId').references('accreditations.id').notNullable();
    t.integer('certificationCenterId').references('certification-centers.id').notNullable();
  });
};
