'use strict';

const TABLE_NAME = 'assessments';

exports.seed = (knex) => {

  return knex(TABLE_NAME).del().then(() => {

    return knex(TABLE_NAME).insert([{

      // Assessments of Jon Snow
      userId: 1,
      courseId: "anyFromAirTable",
      userName: 'Jon Snow',
      userEmail: 'jsnow@winterfell.got'
    }, {

      userId: 1,
      courseId: "anyFromAirTable",
      userName: 'Jon Snow',
      userEmail: 'jsnow@winterfell.got'
    }, {

      userId: 1,
      courseId: "anyFromAirTable",
      userName: 'Jon Snow',
      userEmail: 'jsnow@winterfell.got'
    }, {

      // Assessments of Daenerys Targaryen
      userId: 2,
      courseId: "anyFromAirTable",
      userName: 'Daenerys Targaryen',
      userEmail: 'dtargaryen@targaryen.got'
    }, {

      // Assessments of Tyron Lannister
      userId: 3,
      courseId: "anyFromAirTable",
      userName: 'Tyron Lannister',
      userEmail: 'tlannister@lannister.got'
    }]);

  });

};
