const TABLE_NAME = 'account-recovery-demands';

export const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.integer('userId').alter();
  });
};

export const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.string('userId').alter();
  });
};
