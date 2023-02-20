const TABLE_NAME = 'data-protection-officers';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.bigIncrements().primary();
    t.string('firstName').nullable();
    t.string('lastName').nullable();
    t.string('email').nullable();
    t.bigInteger('organizationId').references('organizations.id').unique().nullable();
    t.bigInteger('certificationCenterId').references('certification-centers.id').unique().nullable();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    t.check('(?? IS NOT NULL AND ?? IS NULL) OR (?? IS NULL AND ?? IS NOT NULL)', [
      'organizationId',
      'certificationCenterId',
      'organizationId',
      'certificationCenterId',
    ]);
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
