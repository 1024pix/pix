module.exports = async function findOrganizationStudents({ organizationId, studentRepository }) {

  const students = await studentRepository.findByOrganizationId({ organizationId });

  return students;
};
