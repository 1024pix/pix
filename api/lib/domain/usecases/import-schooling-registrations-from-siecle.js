const { FileValidationError, SameNationalStudentIdInOrganizationError, SameNationalStudentIdInFileError } = require('../errors');
const _ = require('lodash');
const SchoolingRegistrationParser = require('../../infrastructure/serializers/csv/schooling-registration-parser');

module.exports = async function importSchoolingRegistrationsFromSIECLE({ organizationId, buffer, format, schoolingRegistrationsXmlService, schoolingRegistrationRepository }) {

  let schoolingRegistrationDatas = [];

  if (format === 'xml') {
    schoolingRegistrationDatas = schoolingRegistrationsXmlService.extractSchoolingRegistrationsInformationFromSIECLE(buffer);
  } else if (format === 'csv') {
    const csvSiecleParser = new SchoolingRegistrationParser(buffer, organizationId);
    schoolingRegistrationDatas = csvSiecleParser.parse().registrations;
  } else {
    throw new FileValidationError('Format de fichier non valide.');
  }

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
