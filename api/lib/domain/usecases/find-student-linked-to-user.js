module.exports = async function findStudentLinkedToUser({
  userId,
  studentRepository,
}) {
  return studentRepository.findOneByUserId({ userId });
};
