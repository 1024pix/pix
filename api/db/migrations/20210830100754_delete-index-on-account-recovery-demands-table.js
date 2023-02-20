const TABLE_NAME = 'account-recovery-demands';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex('oldEmail');
    table.dropIndex('newEmail');
    table.dropIndex('temporaryKey');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index('oldEmail');
    table.index('newEmail');
    table.index('temporaryKey');
  });
};
