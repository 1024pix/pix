const _ = require('lodash');
const courseRepository = require('../../../lib/infrastructure/repositories/course-repository');
const Course = require('../models/Course');
const { NotFoundError } = require('../../../lib/domain/errors');

module.exports = {

  async getCourse({ courseId }) {

    // TODO: delete when smart placement assessment does not have courses anymore
    if (_.startsWith(courseId, 'Smart')) {
      return Promise.resolve(new Course({ id: courseId }));
    }

    // TODO This repo switch should not be here because we make a technical discrimination on the course id
    if (_.startsWith(courseId, 'rec')) {
      return courseRepository.get(courseId)
        .then((airtableCourse) => {
          return new Course(airtableCourse);
        }).catch((err) => {
          if ('MODEL_ID_NOT_FOUND' === err.error.type || 'NOT_FOUND' === err.error) {
            throw new NotFoundError();
          }
        });
    }

    throw new NotFoundError();
  }

};
