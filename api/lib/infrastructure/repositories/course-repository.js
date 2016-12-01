const Airtable = require('../airtable');
const Course = require('../../domain/models/referential/course');
const cache = require('../cache');
const logger = require('../logger');

const AIRTABLE_TABLE_NAME = 'Tests';

module.exports = {

  list(isAdaptive) {

    return new Promise((resolve, reject) => {

      const cacheKey = (isAdaptive) ? 'adaptive-course-repository_list' : 'course-repository_list';
      const airtableQuery = (isAdaptive) ? { filterByFormula: '{Adaptatif ?} = TRUE()' } : { view: 'PIX view' };

      cache.get(cacheKey, (err, cachedValue) => {

        if (err) return reject(err);

        if (cachedValue) return resolve(cachedValue);

        let courses = [];

        Airtable.base(AIRTABLE_TABLE_NAME)
          .select(airtableQuery)
          .eachPage((records, fetchNextPage) => {

            for (let record of records) {
              courses.push(new Course(record));
            }
            fetchNextPage();
          }, (err) => {

            if (err) return reject(err);

            cache.set(cacheKey, courses);

            logger.debug('Fetched and cached courses');

            return resolve(courses);
          });
      });
    });
  },

  get(id) {

    return new Promise((resolve, reject) => {

      const cacheKey = `course-repository_get_${id}`;

      cache.get(cacheKey, (err, cachedValue) => {

        if (err) return reject(err);

        if (cachedValue) return resolve(cachedValue);

        return this._fetch(id, reject, cacheKey, resolve);
      });
    });
  },

  refresh(id) {

    return new Promise((resolve, reject) => {

      const cacheKey = `course-repository_get_${id}`;

      cache.del(cacheKey, (err, count) => {

        if (err) return reject(err);

        if (count > 0) logger.debug(`Deleted from cache course ${id}`);

        return this._fetch(id, reject, cacheKey, resolve);
      });
    });
  },

  _fetch: function (id, reject, cacheKey, resolve) {

    Airtable.base(AIRTABLE_TABLE_NAME).find(id, (err, record) => {

      if (err) return reject(err);

      const challenge = new Course(record);

      cache.set(cacheKey, challenge);

      logger.debug(`Fetched and cached course ${id}`);

      return resolve(challenge);
    });
  }

};
