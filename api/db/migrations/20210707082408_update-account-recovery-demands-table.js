const TABLE_NAME = 'account-recovery-demands';

exports.up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.integer('userId').alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (t) => {
    t.string('userId').alter();
  });
};
