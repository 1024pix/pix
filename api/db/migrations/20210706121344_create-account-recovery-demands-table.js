const TABLE_NAME = 'account-recovery-demands';

export const up = function (knex) {
  return knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('userId').index();
    t.string('oldEmail').index();
    t.string('newEmail').index();
    t.string('temporaryKey').index();
    t.boolean('used').default(0);
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
};

export const down = function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};
