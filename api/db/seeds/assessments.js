'use strict';

const TABLE_NAME = 'assessments';

exports.seed = (knex) => {

  knex(TABLE_NAME).del();

  return knex(TABLE_NAME).insert([{

    // Assessments of Jon Snow
    user_id: 1,
    created_at: new Date(),
    updated_at: new Date()
  }, {

    user_id: 1,
    created_at: new Date(),
    updated_at: new Date()
  }, {

    user_id: 1,
    created_at: new Date(),
    updated_at: new Date()
  }, {

    // Assessments of Daenerys Targaryen
    user_id: 2,
    created_at: new Date(),
    updated_at: new Date()
  }, {

    // Assessments of Tyron Lannister
    user_id: 3,
    created_at: new Date(),
    updated_at: new Date()
  }]);

};
