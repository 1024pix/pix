import fs from 'fs/promises';

import { logErrorWithCorrelationIds } from '../../../../../lib/infrastructure/monitoring-tools.js';
import { detectEncoding } from '../../infrastructure/utils/xml/detect-encoding.js';
import * as zip from '../../infrastructure/utils/xml/zip.js';
import { OrganizationImport } from '../models/OrganizationImport.js';

const uploadSiecleFile = async function ({
  userId,
  organizationId,
  payload,
  importStorage,
  organizationImportRepository,
  siecleService = {
    unzip: zip.unzip,
    detectEncoding,
  },
  dependencies = { logErrorWithCorrelationIds },
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
      try {
        await fs.rm(directory, { recursive: true });
      } catch (rmError) {
        dependencies.logErrorWithCorrelationIds(rmError);
      }
    }
  } catch (error) {
    errors.push(error);
    throw error;
  } finally {
    organizationImport.upload({ filename, encoding, errors });
    await organizationImportRepository.save(organizationImport);
  }
};

export { uploadSiecleFile };
