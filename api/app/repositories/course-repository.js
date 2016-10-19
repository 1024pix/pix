'use strict';

const base = require('../../config/airtable').base;
const Course = require('../models/referential/course');

const AIRTABLE_TABLE_NAME = 'Tests';

module.exports = {

  list() {

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
  },

  get(id) {

    return new Promise((resolve, reject) => {

      base(AIRTABLE_TABLE_NAME).find(id, (error, record) => {

        if (error) {
          return reject(error);
        }
        return resolve(new Course(record));
      });
    });
  }
};
