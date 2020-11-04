const { FileValidationError, SameNationalStudentIdInOrganizationError, SameNationalStudentIdInFileError } = require('../errors');
const fs = require('fs').promises;
const bluebird = require('bluebird');
const { SCHOOLING_REGISTRATION_CHUNK_SIZE } = require('../../infrastructure/constants');
const { isEmpty, chunk } = require('lodash');
const SchoolingRegistrationParser = require('../../infrastructure/serializers/csv/schooling-registration-parser');

const NO_SCHOOLING_REGISTRATIONS_FOUND = 'Aucun élève n’a pu être importé depuis ce fichier. Vérifiez que le fichier est conforme.';
const INVALID_FILE_FORMAT = 'Format de fichier non valide.';

module.exports = async function importSchoolingRegistrationsFromSIECLEFormat({ organizationId, payload, format, schoolingRegistrationsXmlService, schoolingRegistrationRepository, organizationRepository }) {
  let schoolingRegistrationData = [];

  const path = payload.path;
  if (format === 'xml') {
    const organization = await organizationRepository.get(organizationId);
    schoolingRegistrationData = await schoolingRegistrationsXmlService.extractSchoolingRegistrationsInformationFromSIECLE(path, organization, schoolingRegistrationsXmlService);
  } else if (format === 'csv') {
    const buffer = await fs.readFile(path);
    const csvSiecleParser = new SchoolingRegistrationParser(buffer, organizationId);
    schoolingRegistrationData = csvSiecleParser.parse().registrations;
  } else {
    throw new FileValidationError(INVALID_FILE_FORMAT);
  }

  fs.unlink(payload.path);

  if (isEmpty(schoolingRegistrationData)) {
    throw new FileValidationError(NO_SCHOOLING_REGISTRATIONS_FOUND);
  }

  try {
    const schoolingRegistrationsChunks = chunk(schoolingRegistrationData, SCHOOLING_REGISTRATION_CHUNK_SIZE);
    await bluebird.mapSeries(schoolingRegistrationsChunks, (chunk) => {
      return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(chunk, organizationId);
    });
  } catch (err) {
    if (err instanceof SameNationalStudentIdInOrganizationError) {
      throw new SameNationalStudentIdInFileError(err.nationalStudentId);
    }
    throw err;
  }
};
