import { School } from '../models/School.js';

import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

const getSchoolByCode = async function ({ code, schoolRepository = injectedRepositories.schoolRepository, organizationLearnerRepository = injectedRepositories.organizationLearnerRepository } = {}) {
  const school = await schoolRepository.getByCode({ code });
  const organizationLearners = await organizationLearnerRepository.getStudentsByOrganizationId({
    organizationId: school.id,
  });
  return new School({ ...school, organizationLearners });
};

export { getSchoolByCode };
