const cache = require('../cache');
const airtable = require('../airtable');
const serializer = require('../serializers/airtable/course-serializer');

const AIRTABLE_TABLE_NAME = 'Tests';

function _getCourses(query, cacheKey) {
  return new Promise((resolve, reject) => {
    cache.get(cacheKey, (err, cachedValue) => {
      if (err) return reject(err);
      if (cachedValue) return resolve(cachedValue);
      airtable
        .getRecords(AIRTABLE_TABLE_NAME, query, serializer)
        .then(courses => {
          cache.set(cacheKey, courses);
          return resolve(courses);
        })
        .catch(reject);
    });
  });
}

function _fetchCourse(id, cacheKey, resolve, reject) {
  airtable
    .getRecord(AIRTABLE_TABLE_NAME, id, serializer)
    .then(course => {
      cache.set(cacheKey, course);
      return resolve(course);
    })
    .catch(reject);
}

module.exports = {

  getProgressionTests() {
    const query = {
      sort: [{ field: 'Ordre affichage', direction: 'asc' }],
      view: 'Tests de progression'
    };
    const cacheKey = 'course-repository_getProgressionTests';
    return _getCourses(query, cacheKey);
  },

  getCoursesOfTheWeek() {
    const query = {
      sort: [{ field: 'Ordre affichage', direction: 'asc' }],
      view: 'Défis de la semaine'
    };
    const cacheKey = 'course-repository_getCoursesOfTheWeek';
    return _getCourses(query, cacheKey);
  },

  getAdaptiveCourses() {
    const query = {
      sort: [{ field: 'Ordre affichage', direction: 'asc' }],
      view: 'Tests de positionnement'
    };
    const cacheKey = 'course-repository_getAdaptiveCourses';
    return _getCourses(query, cacheKey);
  },

  get(id) {
    return new Promise((resolve, reject) => {
      const cacheKey = `course-repository_get_${id}`;
      cache.get(cacheKey, (err, cachedValue) => {
        if (err) return reject(err);
        if (cachedValue) return resolve(cachedValue);
        return _fetchCourse(id, cacheKey, resolve, reject);
      });
    });
  },

  refresh(id) {
    return new Promise((resolve, reject) => {
      const cacheKey = `course-repository_get_${id}`;
      cache.del(cacheKey, (err) => {
        if (err) return reject(err);
        return _fetchCourse(id, cacheKey, resolve, reject);
      });
    });
  }

};
