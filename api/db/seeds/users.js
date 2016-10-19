'use strict';

const TABLE_NAME = 'users';

exports.seed = (knex) => {

  return knex(TABLE_NAME).del().then(() => {

    return knex(TABLE_NAME).insert([{

      firstName: 'Jon',
      lastName: 'Snow',
      email: 'jsnow@winterfell.got',
      login: 'jsnow',
      password: 'WinterIsComing'
    }, {

      firstName: 'Daenerys',
      lastName: 'Targaryen',
      email: 'dtargaryen@targaryen.got',
      login: 'dtargaryen',
      password: 'A1B2C3#!'
    }, {

      firstName: 'Tyron',
      lastName: 'Lannister',
      email: 'tlannister@lannister.got',
      login: 'tlannister',
      password: 'P@s$w0rD'
    }]);

  });

};
