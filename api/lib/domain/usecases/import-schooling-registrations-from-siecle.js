const { FileValidationError, SiecleXmlImportError, SameNationalStudentIdInOrganizationError } = require('../errors');
const fs = require('fs').promises;
const bluebird = require('bluebird');
const { SCHOOLING_REGISTRATION_CHUNK_SIZE } = require('../../infrastructure/constants');
const { isEmpty, chunk } = require('lodash');
const SchoolingRegistrationParser = require('../../infrastructure/serializers/csv/schooling-registration-parser');

const ERRORS = {
  EMPTY: 'EMPTY',
  INE_UNIQUE: 'INE_UNIQUE',
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
};

module.exports = async function importSchoolingRegistrationsFromSIECLEFormat({ organizationId, payload, format, schoolingRegistrationsXmlService, schoolingRegistrationRepository, organizationRepository }) {
  let schoolingRegistrationData = [];

  const organization = await organizationRepository.get(organizationId);
  const path = payload.path;

  if (format === 'xml') {
    schoolingRegistrationData = await schoolingRegistrationsXmlService.extractSchoolingRegistrationsInformationFromSIECLE(path, organization, schoolingRegistrationsXmlService);
  } else if (format === 'csv') {
    const buffer = await fs.readFile(path);

    const csvSiecleParser = SchoolingRegistrationParser.buildParser(buffer, organizationId, organization.isAgriculture);
    schoolingRegistrationData = csvSiecleParser.parse().registrations;
  } else {
    throw new FileValidationError(ERRORS.INVALID_FILE_FORMAT);
  }

  fs.unlink(payload.path);

  if (isEmpty(schoolingRegistrationData)) {
    throw new SiecleXmlImportError(ERRORS.EMPTY);
  }

  try {
    const schoolingRegistrationsChunks = chunk(schoolingRegistrationData, SCHOOLING_REGISTRATION_CHUNK_SIZE);

    await bluebird.mapSeries(schoolingRegistrationsChunks, (chunk) => {
      if (organization.isAgriculture) {
        return schoolingRegistrationRepository.addOrUpdateOrganizationAgriSchoolingRegistrations(chunk, organizationId);
      } else {
        return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(chunk, organizationId);
      }
    });
  } catch (err) {
    if (err instanceof SameNationalStudentIdInOrganizationError) {
      throw new SiecleXmlImportError(ERRORS.INE_UNIQUE, { nationalStudentId: err.nationalStudentId });
    }
    throw err;
  }
};
