'use strict';

const TABLE_NAME = 'assessments';

exports.seed = (knex) => {

  return knex(TABLE_NAME).del().then(() => {

    return knex(TABLE_NAME).insert([{

      // Assessments of Jon Snow
      userId: 1
    }, {

      userId: 1
    }, {

      userId: 1
    }, {

      // Assessments of Daenerys Targaryen
      userId: 2
    }, {

      // Assessments of Tyron Lannister
      userId: 3
    }]);

  });

};
