const { FileValidationError, SameNationalStudentIdInOrganizationError, SameNationalStudentIdInFileError } = require('../errors');
const _ = require('lodash');

module.exports = async function importSchoolingRegistrationsFromSIECLE({ organizationId, buffer, schoolingRegistrationsXmlService, schoolingRegistrationRepository }) {
  const schoolingRegistrationDatas = schoolingRegistrationsXmlService.extractSchoolingRegistrationsInformationFromSIECLE(buffer);

  if (_.isEmpty(schoolingRegistrationDatas)) {
    throw new FileValidationError('Aucune inscription d\'élève n\'a pu être importée depuis ce fichier.Vérifiez que le fichier est conforme.');
  }

  try {
    await schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(schoolingRegistrationDatas, organizationId);
  } catch (err) {
    if (err instanceof SameNationalStudentIdInOrganizationError) {
      throw new SameNationalStudentIdInFileError(err.nationalStudentId);
    }
    throw err;
  }
};
