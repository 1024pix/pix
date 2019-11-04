module.exports = async function getStudentLinkedToUser({
  userId,
  studentRepository,
}) {
  return await studentRepository.getByUserId({ userId });
};
