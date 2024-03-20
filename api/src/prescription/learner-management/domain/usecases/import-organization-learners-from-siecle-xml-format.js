import fs from 'fs/promises';

import { SiecleXmlImportError } from '../errors.js';

const { isEmpty, chunk } = lodash;

import bluebird from 'bluebird';
import lodash from 'lodash';

import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../shared/infrastructure/constants.js';
import { SiecleParser } from '../../infrastructure/serializers/xml/siecle-parser.js';
import { detectEncoding } from '../../infrastructure/utils/xml/detect-encoding.js';
import { SiecleFileStreamer } from '../../infrastructure/utils/xml/siecle-file-streamer.js';
import * as zip from '../../infrastructure/utils/xml/zip.js';
import { OrganizationImport } from '../models/OrganizationImport.js';

const ERRORS = {
  EMPTY: 'EMPTY',
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
};

const importOrganizationLearnersFromSIECLEXMLFormat = async function ({
  userId,
  organizationId,
  payload,
  organizationLearnerRepository,
  organizationRepository,
  importStorage,
  organizationImportRepository,
  siecleService = {
    unzip: zip.unzip,
    detectEncoding,
  },
}) {
  let organizationLearnerData = [];

  let organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });

  const organization = await organizationRepository.get(organizationId);
  const path = payload.path;

  const { file: filePath, directory } = await siecleService.unzip(path);
  const encoding = await siecleService.detectEncoding(filePath);

  let filename;
  const errors = [];
  try {
    filename = await importStorage.sendFile({ filepath: filePath });
    if (directory) {
      await fs.rm(directory, { recursive: true });
    }
  } catch (error) {
    errors.push(error);
    throw error;
  } finally {
    organizationImport.upload({ filename, encoding, errors });
    await organizationImportRepository.save(organizationImport);
  }

  try {
    const readableStreamForUAJ = await importStorage.readFile({ filename });
    const siecleFileStreamerForUAJ = await SiecleFileStreamer.create(readableStreamForUAJ, encoding);
    const parserForUAJ = SiecleParser.create(siecleFileStreamerForUAJ);
    await parserForUAJ.parseUAJ(organization.externalId);

    const readableStream = await importStorage.readFile({ filename });
    const siecleFileStreamer = await SiecleFileStreamer.create(readableStream, encoding);
    const parser = SiecleParser.create(siecleFileStreamer);
    organizationLearnerData = await parser.parse();
    if (isEmpty(organizationLearnerData)) {
      throw new SiecleXmlImportError(ERRORS.EMPTY);
    }
  } catch (error) {
    errors.push(error);
    throw error;
  } finally {
    organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
    organizationImport.validate({ errors });
    await organizationImportRepository.save(organizationImport);
    await importStorage.deleteFile({ filename });
  }

  return DomainTransaction.execute(async (domainTransaction) => {
    try {
      const organizationLearnersChunks = chunk(organizationLearnerData, ORGANIZATION_LEARNER_CHUNK_SIZE);

      const nationalStudentIdData = organizationLearnerData.map((learner) => learner.nationalStudentId, []);

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
    } catch (error) {
      errors.push(error);
      throw error;
    } finally {
      organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
      organizationImport.process({ errors });
      await organizationImportRepository.save(organizationImport);
    }
  });
};

export { importOrganizationLearnersFromSIECLEXMLFormat };
