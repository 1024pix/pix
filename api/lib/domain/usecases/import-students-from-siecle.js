const { FileValidationError, BatchSaveError } = require('../errors');
const _ = require('lodash');

module.exports = async function importStudentsFromSIECLE({ organizationId, buffer, studentsXmlService, studentRepository }) {
  const students = studentsXmlService.extractStudentsInformationFromSIECLE(buffer);

  if (_.isEmpty(students)) {
    throw new FileValidationError('Aucun élève n\'a pu être importé depuis ce fichier. Vérifiez sa conformité.');
  }

  const studentsFromOrganization = await studentRepository.findByOrganizationId({ organizationId });
  const nationalStudentIdsFromOrganization = _.map(studentsFromOrganization, 'nationalStudentId');
  const studentsToUpdate = _.filter(students, (student) => _.includes(nationalStudentIdsFromOrganization, student.nationalStudentId));
  const studentsToCreate = _.difference(students, studentsToUpdate);
  const studentsToCreateWithOrganizationId = _.map(studentsToCreate, (student) => ({ ...student, organizationId }));

  try {
    await studentRepository.batchUpdateWithOrganizationId(studentsToUpdate, organizationId);
    await studentRepository.batchCreate(studentsToCreateWithOrganizationId);
  } catch (err) {
    throw new BatchSaveError('L\'enregistrement des élèves a rencontré une erreur.');
  }
};
