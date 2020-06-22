const _ = require('lodash');
const Course = require('../models/Course');
const { NotFoundError } = require('../../domain/errors');

const courseRepository = require('../../infrastructure/repositories/course-repository');

module.exports = {

  async getCourse({ courseId }) {

    // TODO: delete when campaign assessment does not have courses anymore
    if (_.startsWith(courseId, '[NOT USED] Campaign')) {
      return Promise.resolve(new Course({ id: courseId }));
    }

    // TODO This repo switch should not be here because we make a technical discrimination on the course id
    if (_.startsWith(courseId, 'rec')) {
      return courseRepository.get(courseId);
    }

    throw new NotFoundError();
  }

};
