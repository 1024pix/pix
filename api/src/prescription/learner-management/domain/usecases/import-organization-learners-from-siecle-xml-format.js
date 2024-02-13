import { SiecleXmlImportError } from '../errors.js';

import fs from 'fs/promises';

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

const importOrganizationLearnersFromSIECLEXMLFormat = async function ({
  organizationId,
  payload,
  organizationLearnerRepository,
  organizationRepository,
  importStorage,
  siecleService = {
    unzip: zip.unzip,
    detectEncoding,
  },
}) {
  let organizationLearnerData = [];

  const organization = await organizationRepository.get(organizationId);
  const path = payload.path;

  const { file: filePath, directory } = await siecleService.unzip(path);
  const encoding = await siecleService.detectEncoding(filePath);

  const filename = await importStorage.sendFile({ filepath: filePath });

  try {
    if (directory) {
      await fs.rm(directory, { recursive: true });
    }
    const readableStreamForUAJ = await importStorage.readFile({ filename });
    const siecleFileStreamerForUAJ = await SiecleFileStreamer.create(readableStreamForUAJ, encoding);
    const parserForUAJ = SiecleParser.create(organization, siecleFileStreamerForUAJ);
    await parserForUAJ.parseUAJ(organization.externalId);

    const readableStream = await importStorage.readFile({ filename });
    const siecleFileStreamer = await SiecleFileStreamer.create(readableStream, encoding);
    const parser = SiecleParser.create(organization, siecleFileStreamer);
    organizationLearnerData = await parser.parse();
  } finally {
    await importStorage.deleteFile({ filename });
  }

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

export { importOrganizationLearnersFromSIECLEXMLFormat };
