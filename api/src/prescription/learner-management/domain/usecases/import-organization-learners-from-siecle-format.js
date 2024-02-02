import { FileValidationError } from '../../../../../lib/domain/errors.js';
import { SiecleXmlImportError } from '../errors.js';

import * as fs from 'fs/promises';

const { isEmpty, chunk } = lodash;

import bluebird from 'bluebird';
import lodash from 'lodash';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../shared/infrastructure/constants.js';
import { SiecleParser } from '../../infrastructure/serializers/xml/siecle-parser.js';
import { SiecleFileStreamer } from '../../infrastructure/utils/xml/siecle-file-streamer.js';
import * as zip from '../../infrastructure/utils/xml/zip.js';
import { detectEncoding } from '../../infrastructure/utils/xml/detect-encoding.js';

const ERRORS = {
  EMPTY: 'EMPTY',
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
};

const importOrganizationLearnersFromSIECLEFormat = async function ({
  organizationId,
  payload,
  format,
  organizationLearnersCsvService,
  organizationLearnerRepository,
  organizationRepository,
  siecleService = {
    unzip: zip.unzip,
    detectEncoding,
  },
  i18n,
}) {
  let organizationLearnerData = [];

  const organization = await organizationRepository.get(organizationId);
  const path = payload.path;

  if (format === 'xml') {
    const { file: filePath, directory } = await siecleService.unzip(path);
    const encoding = await siecleService.detectEncoding(filePath);

    const siecleFileStreamer = await SiecleFileStreamer.create(filePath, encoding);
    const parser = SiecleParser.create(organization, siecleFileStreamer);

    organizationLearnerData = await parser.parse();

    if (directory) {
      await fs.rm(directory, { recursive: true });
    }
  } else if (format === 'csv') {
    organizationLearnerData = await organizationLearnersCsvService.extractOrganizationLearnersInformation(
      path,
      organization,
      i18n,
    );
  } else {
    throw new FileValidationError(ERRORS.INVALID_FILE_EXTENSION, { fileExtension: format });
  }

  fs.unlink(payload.path);

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
