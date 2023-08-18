import * as courseRepository from '../../infrastructure/repositories/course-repository.js';
import { NotFoundError } from '../errors.js';

const getCourse = async function ({ courseId, dependencies = { courseRepository } }) {
  const course = await dependencies.courseRepository.get(courseId);
  if (!course.canBePlayed) {
    throw new NotFoundError("Le test demandé n'existe pas");
  }
  return course;
};

export { getCourse };
