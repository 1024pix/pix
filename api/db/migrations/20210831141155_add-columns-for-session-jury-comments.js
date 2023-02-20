const TABLE_NAME = 'sessions';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text('juryComment').defaultsTo(null);
    table.integer('juryCommentAuthorId').unsigned().references('users.id').defaultsTo(null);
    table.dateTime('juryCommentedAt').defaultsTo(null);
  });
};

export const down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumn('juryComment');
    table.dropColumn('juryCommentAuthorId');
    table.dropColumn('juryCommentedAt');
  });
};
