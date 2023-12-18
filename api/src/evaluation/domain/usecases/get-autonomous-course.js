import { NotFoundError } from '../../../shared/domain/errors.js';

const getAutonomousCourse = async function ({ autonomousCourseId, autonomousCourseRepository }) {
  const autonomousCourse = await autonomousCourseRepository.get({ autonomousCourseId });

  if (!autonomousCourse) {
    throw new NotFoundError(`No autonomous-course found with id ${autonomousCourseId}`);
  }
  return autonomousCourse;
};

export { getAutonomousCourse };
