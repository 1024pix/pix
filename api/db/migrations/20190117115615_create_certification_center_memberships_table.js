const CERTIFICATION_CENTER_MEMBERSHIPS = 'certification-center-memberships';

export const up = (knex) => {
  return knex.schema.createTable(CERTIFICATION_CENTER_MEMBERSHIPS, (t) => {
    t.increments('id').primary();
    t.bigInteger('userId').references('users.id').index();
    t.bigInteger('certificationCenterId').references('certification-centers.id').index();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.unique(['userId', 'certificationCenterId']);
  });
};

export const down = (knex) => {
  return knex.schema.dropTable(CERTIFICATION_CENTER_MEMBERSHIPS);
};
