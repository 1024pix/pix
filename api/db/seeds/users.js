'use strict';

const TABLE_NAME = 'users';

exports.seed = (knex) => {

  return knex(TABLE_NAME).del().then(() => {

    return knex(TABLE_NAME).insert([{

      firstName: 'Jon',
      lastName: 'Snow',
      email: 'jsnow@winterfell.got',
      password: 'WinterIsComing'
    }, {

      firstName: 'Daenerys',
      lastName: 'Targaryen',
      email: 'dtargaryen@targaryen.got',
      password: 'A1B2C3#!'
    }, {

      firstName: 'Tyron',
      lastName: 'Lannister',
      email: 'tlannister@lannister.got',
      password: 'P@s$w0rD'
    }]);

  });

};
