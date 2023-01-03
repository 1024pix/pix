const TABLE_NAME = 'users';

exports.up = function (knex) {
  return knex(TABLE_NAME).whereILike('email', 'email\\_%@example.net').update({ hasBeenAnonymised: true });
};

exports.down = function (knex) {
  return knex(TABLE_NAME).whereILike('email', 'email\\_%@example.net').update({ hasBeenAnonymised: false });
};
