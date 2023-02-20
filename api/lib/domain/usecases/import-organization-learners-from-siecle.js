import { FileValidationError, SiecleXmlImportError } from '../errors';
import { promises as fs } from 'fs';
import bluebird from 'bluebird';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../infrastructure/constants';
import { isEmpty, chunk } from 'lodash';
import DomainTransaction from '../../infrastructure/DomainTransaction';

const ERRORS = {
  EMPTY: 'EMPTY',
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
};

export default async function importOrganizationLearnersFromSIECLEFormat({
  organizationId,
  payload,
  format,
  organizationLearnersCsvService,
  organizationLearnersXmlService,
  organizationLearnerRepository,
  organizationRepository,
  i18n,
}) {
  let organizationLearnerData = [];

  const organization = await organizationRepository.get(organizationId);
  const path = payload.path;

  if (format === 'xml') {
    organizationLearnerData = await organizationLearnersXmlService.extractOrganizationLearnersInformationFromSIECLE(
      path,
      organization
    );
  } else if (format === 'csv') {
    organizationLearnerData = await organizationLearnersCsvService.extractOrganizationLearnersInformation(
      path,
      organization,
      i18n
    );
  } else {
    throw new FileValidationError(ERRORS.INVALID_FILE_EXTENSION, { fileExtension: format });
  }

  fs.unlink(payload.path);

  if (isEmpty(organizationLearnerData)) {
    throw new SiecleXmlImportError(ERRORS.EMPTY);
  }

  const organizationLearnersChunks = chunk(organizationLearnerData, ORGANIZATION_LEARNER_CHUNK_SIZE);

  return DomainTransaction.execute(async (domainTransaction) => {
    await organizationLearnerRepository.disableAllOrganizationLearnersInOrganization({
      domainTransaction,
      organizationId,
    });

    await bluebird.mapSeries(organizationLearnersChunks, (chunk) => {
      return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
        chunk,
        organizationId,
        domainTransaction
      );
    });
  });
}
