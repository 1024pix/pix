const getSchoolByCode = async function ({ code, schoolRepository, organizationLearnersRepository } = {}) {
  const school = await schoolRepository.getByCode(code);
  const students = await organizationLearnersRepository.getStudentsByOrganizationId(school.id);
  school['organizationLearners'] = students;
  return school;
};

export { getSchoolByCode };
