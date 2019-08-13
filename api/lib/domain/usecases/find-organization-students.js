module.exports = function findOrganizationStudents({ organizationId, studentRepository }) {
  return studentRepository.findByOrganizationId({ organizationId });
};
