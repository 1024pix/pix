module.exports = async function findOrganizationStudents({ organizationId, studentRepository, userRepository }) {

  const students = await studentRepository.findByOrganizationId({ organizationId });

  for (const student of students) {
    if (student.userId) {
      const user = await userRepository.get(student.userId);
      student.username = user.username;
    }
  }

  return students;
};
