import _ from 'lodash';
import { Course } from '../models/Course.js';
import { NotFoundError } from '../../domain/errors.js';

import * as courseRepository from '../../infrastructure/repositories/course-repository.js';

const getCourse = async function ({ courseId, dependencies = { courseRepository } }) {
  // TODO: delete when campaign assessment does not have courses anymore
  if (_.startsWith(courseId, '[NOT USED] Campaign')) {
    return Promise.resolve(new Course({ id: courseId }));
  }

  // TODO This repo switch should not be here because we make a technical discrimination on the course id
  if (_.startsWith(courseId, 'rec')) {
    return dependencies.courseRepository.get(courseId);
  }

  throw new NotFoundError();
};

export { getCourse };
