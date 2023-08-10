import * as courseRepository from '../../infrastructure/repositories/course-repository.js';

const getCourse = async function ({ courseId, dependencies = { courseRepository } }) {
  return dependencies.courseRepository.get(courseId);
};

export { getCourse };
