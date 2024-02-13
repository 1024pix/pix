const getSchoolByCode = async function ({ code, schoolRepository, organizationLearnerRepository } = {}) {
  const school = await schoolRepository.getByCode(code);
  const students = await organizationLearnerRepository.getStudentsByOrganizationId(school.id);
  school['organizationLearners'] = students;
  return school;
};

export { getSchoolByCode };
