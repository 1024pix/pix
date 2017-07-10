'use strict';

const TABLE_NAME = 'users';

exports.seed = (knex) => {

  return knex(TABLE_NAME).del().then(() => {

    return knex(TABLE_NAME).insert([
      {
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
      },
      {

        firstName: 'Pix',
        lastName: 'Aile',
        email: 'pix@contact.com',
        password: '$2a$05$.EhuqNtCbjSKJlv7X2mO5.xO9hu1DuMvA1JGFLyExzFQ4ywN4oOBC'
      }
    ]);

  });

};
