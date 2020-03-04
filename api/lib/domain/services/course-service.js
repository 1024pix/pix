const _ = require('lodash');
const Course = require('../models/Course');
const { NotFoundError } = require('../../domain/errors');

const { HttpError } = require('../../application/http-errors');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const logger = require('../../infrastructure/logger');

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
          logger.error(err);
          if ('NOT_FOUND' === err.error || (_.has(err, 'error.type') && 'MODEL_ID_NOT_FOUND' === err.error.type)) {
            throw new NotFoundError();
          }
          throw new HttpError(err.message);
        });
    }

    throw new NotFoundError();
  }

};
