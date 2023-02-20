const TABLE_NAME = 'certification-center-invitations';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('certificationCenterId').references('certification-centers.id').index();
    table.string('email').notNullable();
    table.string('status').notNullable();
    table.string('code').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.check(`"status" IN ( 'pending', 'accepted', 'cancelled')`);
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
