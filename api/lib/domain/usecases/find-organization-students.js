module.exports = async function findOrganizationStudents({ organizationId, studentRepository, userRepository }) {

  const students = await studentRepository.findByOrganizationId({ organizationId });

  for (const student of students) {
    const isUserReconcilied = student.userId;
    if (isUserReconcilied) {
      const user = await userRepository.get(student.userId);
      student.username = user.username;
      student.email = user.email;
      student.isAuthenticatedFromGAR = (user.samlId) ? true : false;
    }
  }

  return students;
};
