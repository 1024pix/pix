import { School } from '../models/School.js';

const getSchoolByCode = async function ({ code, schoolRepository, organizationLearnerRepository } = {}) {
  const school = await schoolRepository.getByCode(code);
  const organizationLearners = await organizationLearnerRepository.getStudentsByOrganizationId({
    organizationId: school.id,
  });
  return new School({ ...school, organizationLearners });
};

export { getSchoolByCode };
