const { FileValidationError } = require('../errors');
const _ = require('lodash');

module.exports = async function importStudentsFromSIECLE({ organizationId, buffer, studentsXmlService, studentRepository }) {
  const students = studentsXmlService.extractStudentsInformationFromSIECLE(buffer);

  if (_.isEmpty(students)) {
    throw new FileValidationError('Aucun élève n\'a pu être importé depuis ce fichier. Vérifiez sa conformité.');
  }

  const studentsFromOrganization = await studentRepository.findByOrganizationId({ organizationId });
  const nationalStudentIdsFromOrganization = _.map(studentsFromOrganization, 'nationalStudentId');
  const studentsToUpdate = _.filter(students, (student) => _.includes(nationalStudentIdsFromOrganization, student.nationalStudentId));

  if (!_.isEmpty(studentsToUpdate)) await studentRepository.batchUpdateWithOrganizationId(studentsToUpdate, organizationId);

  const studentsToCreate = _.difference(students, studentsToUpdate);
  if (!_.isEmpty(studentsToCreate)) {
    const studentsToCreateWithOrganizationId = _.map(studentsToCreate, (student) => ({ ...student, organizationId }));

    await studentRepository.batchSave(studentsToCreateWithOrganizationId);
  }

};
