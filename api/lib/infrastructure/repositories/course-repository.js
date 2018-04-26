const cache = require('../cache');
const airtable = require('../airtable');
const serializer = require('../serializers/airtable/course-serializer');
const Course = require('../../domain/models/Course');

const AIRTABLE_TABLE_NAME = 'Tests';
const AIRTABLE_TABLE_VIEW_PROGRESSION_COURSES = 'Tests de progression';
const AIRTABLE_TABLE_VIEW_ADAPTIVE_COURSES = 'Tests de positionnement';
const AIRTABLE_TABLE_VIEW_COURSES_OF_THE_WEEK = 'Défis de la semaine';

const CACHE_KEY_GET_PROGRESSION_COURSES = 'course-repository_getProgressionTests';
const CACHE_KEY_GET_COURSES_OF_THE_WEEK = 'course-repository_getCoursesOfTheWeek';
const CACHE_KEY_GET_ADAPTIVE_COURSES = 'course-repository_getAdaptiveCourses';

function _getCourses(viewName, cacheKey) {
  return new Promise((resolve, reject) => {
    cache.get(cacheKey, (err, cachedValue) => {
      if (err) return reject(err);
      if (cachedValue) return resolve(cachedValue);

      const query = {
        filterByFormula: '{Statut} = "Publié"',
        view: viewName
      };
      airtable
        .getRecords(AIRTABLE_TABLE_NAME, query, serializer)
        .then(courses => {
          courses = courses.map(course => new Course(course));
          cache.set(cacheKey, courses);
          return resolve(courses);
        })
        .catch(reject);
    });
  });
}

function _fetchCourse(id, cacheKey, resolve, reject) {
  airtable.getRecord(AIRTABLE_TABLE_NAME, id, serializer)
    .then(course => {
      cache.set(cacheKey, course);
      return resolve(course);
    })
    .catch(reject);
}

module.exports = {

  getProgressionCourses() {
    return _getCourses(AIRTABLE_TABLE_VIEW_PROGRESSION_COURSES, CACHE_KEY_GET_PROGRESSION_COURSES);
  },

  getCoursesOfTheWeek() {
    return _getCourses(AIRTABLE_TABLE_VIEW_COURSES_OF_THE_WEEK, CACHE_KEY_GET_COURSES_OF_THE_WEEK);
  },

  getAdaptiveCourses() {
    return _getCourses(AIRTABLE_TABLE_VIEW_ADAPTIVE_COURSES, CACHE_KEY_GET_ADAPTIVE_COURSES);
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

  // TODO: delete
  /**
   * @deprecated use the generic refresh endpoint
   */
  refresh(id) {
    return new Promise((resolve, reject) => {
      const cacheKey = `course-repository_get_${id}`;
      cache.del(cacheKey, (err) => {
        if (err) return reject(err);
        return _fetchCourse(id, cacheKey, resolve, reject);
      });
    });
  },

  // TODO: delete
  /**
   * @deprecated use the generic refresh endpoint
   */
  refreshAll() {
    return new Promise((resolve, reject) => {
      cache.del(CACHE_KEY_GET_PROGRESSION_COURSES, (err) => {
        if (err) return reject(err);
        cache.del(CACHE_KEY_GET_COURSES_OF_THE_WEEK, (err) => {
          if (err) return reject(err);
          cache.del(CACHE_KEY_GET_ADAPTIVE_COURSES, (err) => {
            if (err) return reject(err);
            return resolve(true);
          });
        });
      });
    });
  }

};
