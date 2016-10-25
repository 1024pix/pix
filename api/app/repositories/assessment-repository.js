'use strict';

// const base = require('../../config/airtable').base;
const Assessment = require('../models/data/assessment');

// const AIRTABLE_TABLE_NAME = 'Tests';

module.exports = {

  /* list() {

    let courses = [];

    return new Promise((resolve, reject) => {

      base(AIRTABLE_TABLE_NAME)
        .select({ view: 'PIX view' })
        .eachPage((records, fetchNextPage) => {

          for (let record of records) {
            courses.push(new Course(record));
          }
          fetchNextPage();
        }, (error) => {

          if (error) {
            return reject(error);
          }
          return resolve(courses);
        });
    });
  }, */

  get(id) {

    return new Promise((resolve, reject) => {

      Assessment.where('id', id).fetch().then((assessment) => {

        return resolve(assessment);
      }).catch((error) => {

        return reject(error);
      });
    });
  }
};
