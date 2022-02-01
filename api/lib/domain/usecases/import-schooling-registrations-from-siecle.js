const { FileValidationError, SiecleXmlImportError } = require('../errors');
const fs = require('fs').promises;
const bluebird = require('bluebird');
const { SCHOOLING_REGISTRATION_CHUNK_SIZE } = require('../../infrastructure/constants');
const { isEmpty, chunk } = require('lodash');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

const ERRORS = {
  EMPTY: 'EMPTY',
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
};

module.exports = async function importSchoolingRegistrationsFromSIECLEFormat({
  organizationId,
  payload,
  format,
  schoolingRegistrationsCsvService,
  schoolingRegistrationsXmlService,
  schoolingRegistrationRepository,
  organizationRepository,
  i18n,
}) {
  let schoolingRegistrationData = [];

  const organization = await organizationRepository.get(organizationId);
  const path = payload.path;

  if (format === 'xml') {
    schoolingRegistrationData =
      await schoolingRegistrationsXmlService.extractSchoolingRegistrationsInformationFromSIECLE(path, organization);
  } else if (format === 'csv') {
    schoolingRegistrationData = await schoolingRegistrationsCsvService.extractSchoolingRegistrationsInformation(
      path,
      organization,
      i18n
    );
  } else {
    throw new FileValidationError(ERRORS.INVALID_FILE_EXTENSION, { fileExtension: format });
  }

  fs.unlink(payload.path);

  if (isEmpty(schoolingRegistrationData)) {
    throw new SiecleXmlImportError(ERRORS.EMPTY);
  }

  const schoolingRegistrationsChunks = chunk(schoolingRegistrationData, SCHOOLING_REGISTRATION_CHUNK_SIZE);

  return DomainTransaction.execute(async (domainTransaction) => {
    await schoolingRegistrationRepository.disableAllSchoolingRegistrationsInOrganization({
      domainTransaction,
      organizationId,
    });

    await bluebird.mapSeries(schoolingRegistrationsChunks, (chunk) => {
      return schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(
        chunk,
        organizationId,
        domainTransaction
      );
    });
  });
};
