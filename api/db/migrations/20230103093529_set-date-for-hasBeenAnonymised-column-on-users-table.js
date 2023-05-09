const TABLE_NAME = 'users';

const up = function(knex) {
  return knex(TABLE_NAME).whereILike('email', 'email\\_%@example.net').update({ hasBeenAnonymised: true });
};

const down = function(knex) {
  return knex(TABLE_NAME).whereILike('email', 'email\\_%@example.net').update({ hasBeenAnonymised: false });
};

export { up, down };
