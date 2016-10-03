'use strict';

const TABLE_NAME = 'users';

exports.seed = function (knex, Promise) {

  knex(TABLE_NAME).del();

  return knex(TABLE_NAME).insert([{

    first_name: 'Jon',
    last_name: 'Snow',
    email: 'jsnow@winterfell.got',
    login: 'jsnow',
    password: 'WinterIsComing',
    created_at: new Date(),
    updated_at: new Date()
  }, {

    first_name: 'Daenerys',
    last_name: 'Targaryen',
    email: 'dtargaryen@targaryen.got',
    login: 'dtargaryen',
    password: 'A1B2C3#!',
    created_at: new Date(),
    updated_at: new Date()
  }, {

    first_name: 'Tyron',
    last_name: 'Lannister',
    email: 'tlannister@lannister.got',
    login: 'tlannister',
    password: 'P@s$w0rD',
    created_at: new Date(),
    updated_at: new Date()
  }]);

};
