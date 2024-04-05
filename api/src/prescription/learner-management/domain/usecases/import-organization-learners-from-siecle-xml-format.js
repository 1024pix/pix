import fs from 'fs/promises';

import { detectEncoding } from '../../infrastructure/utils/xml/detect-encoding.js';
import * as zip from '../../infrastructure/utils/xml/zip.js';
import { OrganizationImport } from '../models/OrganizationImport.js';

const importOrganizationLearnersFromSIECLEXMLFormat = async function ({
  userId,
  organizationId,
  payload,
  importStorage,
  organizationImportRepository,
  siecleService = {
    unzip: zip.unzip,
    detectEncoding,
  },
}) {
  const organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });

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
};

export { importOrganizationLearnersFromSIECLEXMLFormat };
