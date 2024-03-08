import { mapToOrganizationLearnerDtos } from '../mappers/map-to-organization-learner-dtos.js';

const getSchoolByCode = async function ({ code, schoolRepository, organizationLearnerRepository } = {}) {
  const school = await schoolRepository.getByCode(code);
  const students = await organizationLearnerRepository.getStudentsByOrganizationId(school.id);
  school['organizationLearners'] = mapToOrganizationLearnerDtos(students);
  return school;
};

export { getSchoolByCode };
