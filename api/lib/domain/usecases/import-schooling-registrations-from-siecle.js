const { FileValidationError, SameNationalStudentIdInOrganizationError, SameNationalStudentIdInFileError } = require('../errors');
const { isEmpty } = require('lodash');
const fs = require('fs').promises;
const SchoolingRegistrationParser = require('../../infrastructure/serializers/csv/schooling-registration-parser');

const NO_SCHOOLING_REGISTRATIONS_FOUND = 'Aucune inscription d‘élève n‘a pu être importée depuis ce fichier. Vérifiez que le fichier est conforme.';
const FILE_FORMAT_NOT_VALID = 'Format de fichier non valide.';

module.exports = async function importSchoolingRegistrationsFromSIECLEFormat({ organizationId, payload, format, schoolingRegistrationsXmlService, schoolingRegistrationRepository, organizationRepository }) {
  let schoolingRegistrationData = [];

  if (format === 'xml') {
    const organization = await organizationRepository.get(organizationId);
    schoolingRegistrationData = await schoolingRegistrationsXmlService.extractSchoolingRegistrationsInformationFromSIECLE(payload, organization, schoolingRegistrationsXmlService);
  } else if (format === 'csv') {
    const csvSiecleParser = new SchoolingRegistrationParser(buffer, organizationId);
    schoolingRegistrationData = csvSiecleParser.parse().registrations;
  } else {
    throw new FileValidationError('Format de fichier non valide.');
  }

  fs.unlink(payload.path);

  if (isEmpty(schoolingRegistrationData)) {
    throw new FileValidationError(NO_SCHOOLING_REGISTRATIONS_FOUND);
  }

  try {
    await schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(schoolingRegistrationData, organizationId);
  } catch (err) {
    if (err instanceof SameNationalStudentIdInOrganizationError) {
      throw new SameNationalStudentIdInFileError(err.nationalStudentId);
    }
    throw err;
  }
};
