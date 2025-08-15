import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

const updateAutonomousCourse = async ({
  autonomousCourse,
  autonomousCourseRepository = injectedRepositories.autonomousCourseRepository,
} = {}) => {
  return autonomousCourseRepository.update({ autonomousCourse });
};

export { updateAutonomousCourse };
