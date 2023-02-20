const TABLE_NAME = 'users';

export const up = function (knex) {
  return knex(TABLE_NAME).whereILike('email', 'email\\_%@example.net').update({ hasBeenAnonymised: true });
};

export const down = function (knex) {
  return knex(TABLE_NAME).whereILike('email', 'email\\_%@example.net').update({ hasBeenAnonymised: false });
};
