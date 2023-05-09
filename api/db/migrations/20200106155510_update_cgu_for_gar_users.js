const TABLE_NAME = 'users';

const up = function(knex) {
  return knex(TABLE_NAME).whereNotNull('samlId').update({ cgu: false });
};

const down = function(knex) {
  return knex(TABLE_NAME).whereNotNull('samlId').update({ cgu: true });
};

export { up, down };
