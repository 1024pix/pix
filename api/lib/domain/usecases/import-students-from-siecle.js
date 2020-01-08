const { FileValidationError, BatchSaveError } = require('../errors');
const _ = require('lodash');

module.exports = async function importStudentsFromSIECLE({ organizationId, buffer, studentsXmlService, studentRepository }) {
  const studentDatas = studentsXmlService.extractStudentsInformationFromSIECLE(buffer);

  if (_.isEmpty(studentDatas)) {
    throw new FileValidationError('Aucun élève n\'a pu être importé depuis ce fichier. Vérifiez sa conformité.');
  }

  try {
    await studentRepository.addOrUpdateOrganizationStudents(studentDatas, organizationId);
  } catch (err) {
    throw new BatchSaveError('L\'enregistrement des élèves a rencontré une erreur.');
  }
};
