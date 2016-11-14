const base = require('../airtable').base;
const Course = require('../../domain/models/referential/course');
const cache = require('../cache');

const AIRTABLE_TABLE_NAME = 'Tests';

module.exports = {

  list() {

    return new Promise((resolve, reject) => {

      cache.get('courses', (err, cachedValue) => {

        if (err) return reject(err);

        if (cachedValue) return resolve(cachedValue);

        let courses = [];

        base(AIRTABLE_TABLE_NAME)
          .select({ view: 'PIX view' })
          .eachPage((records, fetchNextPage) => {

            for (let record of records) {
              courses.push(new Course(record));
            }
            fetchNextPage();
          }, (err) => {

            if (err) return reject(err);

            cache.set('courses', courses);

            return resolve(courses);
          });
      });
    });
  },

  get(id) {

    return new Promise((resolve, reject) => {

      cache.get(`course_${id}`, (err, value) => {

        if (err) return reject(err);

        if (value) return resolve(value);

        base(AIRTABLE_TABLE_NAME).find(id, (err, record) => {

          if (err) return reject(err);

          const course = new Course(record);

          cache.set(`course_${id}`, course);

          return resolve(course);
        });
      });
    });
  }
};
