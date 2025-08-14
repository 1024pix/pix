import { NotFoundError } from '../../../shared/domain/errors.js';

import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

const getAutonomousCourse = async function(
  { autonomousCourseId, autonomousCourseRepository = injectedRepositories.autonomousCourseRepository } = {},
) {
  const autonomousCourse = await autonomousCourseRepository.get({ autonomousCourseId });

  if (!autonomousCourse) {
    throw new NotFoundError(`No autonomous-course found with id ${autonomousCourseId}`);
  }
  return autonomousCourse;
};

export { getAutonomousCourse };
