const TABLE_NAME = 'account-recovery-demands';

const up = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.integer('userId').alter();
  });
};

const down = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.string('userId').alter();
  });
};

export { up, down };
