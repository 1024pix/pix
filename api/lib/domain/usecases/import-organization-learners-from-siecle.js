import { FileValidationError, SiecleXmlImportError } from '../errors.js';
import * as fs from 'fs';
const fsPromises = fs.promises;

import path from 'path';

const { isEmpty, chunk } = lodash;

import bluebird from 'bluebird';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../infrastructure/constants.js';
import lodash from 'lodash';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';

const ERRORS = {
  EMPTY: 'EMPTY',
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
};

const importOrganizationLearnersFromSIECLEFormat = async function ({
  organizationId,
  payload,
  format,
  organizationLearnersCsvService,
  organizationLearnersXmlService,
  organizationLearnerRepository,
  organizationRepository,
  i18n,
  importStorage,
}) {
  let organizationLearnerData = [];

  const organization = await organizationRepository.get(organizationId);
  const filePath = payload.path;

  // Try to upload on bucket
  const readableStream = fs.createReadStream(filePath);
  const filename = path.basename(filePath);

  await importStorage.sendFile({ filename, readableStream });

  if (format === 'xml') {
    organizationLearnerData = await organizationLearnersXmlService.extractOrganizationLearnersInformationFromSIECLE(
      filePath,
      organization,
      importStorage,
    );
  } else if (format === 'csv') {
    organizationLearnerData = await organizationLearnersCsvService.extractOrganizationLearnersInformation(
      filePath,
      organization,
      i18n,
    );
  } else {
    throw new FileValidationError(ERRORS.INVALID_FILE_EXTENSION, { fileExtension: format });
  }

  fsPromises.unlink(payload.path);

  if (isEmpty(organizationLearnerData)) {
    throw new SiecleXmlImportError(ERRORS.EMPTY);
  }

  const organizationLearnersChunks = chunk(organizationLearnerData, ORGANIZATION_LEARNER_CHUNK_SIZE);

  const nationalStudentIdData = organizationLearnerData.map((learner) => learner.nationalStudentId, []);

  return DomainTransaction.execute(async (domainTransaction) => {
    await organizationLearnerRepository.disableAllOrganizationLearnersInOrganization({
      domainTransaction,
      organizationId,
      nationalStudentIds: nationalStudentIdData,
    });

    await bluebird.mapSeries(organizationLearnersChunks, (chunk) => {
      return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
        chunk,
        organizationId,
        domainTransaction,
      );
    });
  });
};

export { importOrganizationLearnersFromSIECLEFormat };
