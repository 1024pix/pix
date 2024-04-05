import fs from 'fs/promises';

import { AggregateImportError, SiecleXmlImportError } from '../errors.js';

const { isEmpty } = lodash;

import lodash from 'lodash';

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

  let filename, encoding;
  const errors = [];
  try {
    const { file: filePath, directory } = await siecleService.unzip(path);
    encoding = await siecleService.detectEncoding(filePath);
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
    if (error instanceof AggregateImportError) {
      errors.push(...error.meta);
    } else {
      errors.push(error);
    }
    throw error;
  } finally {
    organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
    organizationImport.validate({ errors });
    await organizationImportRepository.save(organizationImport);
  }
};

export { importOrganizationLearnersFromSIECLEXMLFormat };
