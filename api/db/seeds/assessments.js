'use strict';

const TABLE_NAME = 'assessments';

exports.seed = (knex) => {

  return knex(TABLE_NAME).del().then(() => {

    return knex(TABLE_NAME).insert([{

      // Assessments of Jon Snow
      courseId: "anyFromAirTable",
      userName: 'Jon Snow',
      userEmail: 'jsnow@winterfell.got'
    }, {

      courseId: "anyFromAirTable",
      userName: 'Jon Snow',
      userEmail: 'jsnow@winterfell.got'
    }, {

      courseId: "anyFromAirTable",
      userName: 'Jon Snow',
      userEmail: 'jsnow@winterfell.got'
    }, {

      // Assessments of Daenerys Targaryen
      courseId: "anyFromAirTable",
      userName: 'Daenerys Targaryen',
      userEmail: 'dtargaryen@targaryen.got'
    }, {

      // Assessments of Tyron Lannister
      courseId: "anyFromAirTable",
      userName: 'Tyron Lannister',
      userEmail: 'tlannister@lannister.got'
    }]);

  });

};
