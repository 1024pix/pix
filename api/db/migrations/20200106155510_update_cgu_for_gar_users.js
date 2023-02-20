const TABLE_NAME = 'users';

export const up = function (knex) {
  return knex(TABLE_NAME).whereNotNull('samlId').update({ cgu: false });
};

export const down = function (knex) {
  return knex(TABLE_NAME).whereNotNull('samlId').update({ cgu: true });
};
