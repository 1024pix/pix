module.exports = async function importStudents({ organizationId, buffer, studentsXmlService, studentRepository }) {
  const students = studentsXmlService.extractStudentsInformations(buffer);

  const domainStudents = students.map((student) => ({ ...student, organizationId }));

  return studentRepository.batchSave(domainStudents).then((lastStudentId) => lastStudentId[0]);
};
