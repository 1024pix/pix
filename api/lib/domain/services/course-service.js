import _ from 'lodash';
import { Course } from '../models/Course.js';
import * as courseRepository from '../../infrastructure/repositories/course-repository.js';

const getCourse = async function ({ courseId, dependencies = { courseRepository } }) {
  // TODO: delete when campaign assessment does not have courses anymore
  if (_.startsWith(courseId, '[NOT USED] Campaign')) {
    return new Course({ id: courseId });
  }

  return dependencies.courseRepository.get(courseId);
};

export { getCourse };
