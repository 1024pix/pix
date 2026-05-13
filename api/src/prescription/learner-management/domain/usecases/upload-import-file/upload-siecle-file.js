import fs from 'node:fs/promises';

import { DomainTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { logger } from '../../../../../shared/infrastructure/utils/logger.js';
import { detectEncoding } from '../../../infrastructure/utils/xml/detect-encoding.js';
import * as zip from '../../../infrastructure/utils/xml/zip.js';
import { ValidateSiecleFileJob } from '../../models/jobs/ValidateSiecleFileJob.js';
import { OrganizationImportStatus } from '../../models/OrganizationImportStatus.js';

const uploadSiecleFile = async function ({
  userId,
  organizationId,
  payload,
  importStorage,
  organizationImportRepository,
  validateSiecleFileJobRepository,
  siecleService = {
    unzip: zip.unzip,
    detectEncoding,
  },
  dependencies = { logger },
}) {
  const organizationImport = await DomainTransaction.execute(async () => {
    let organizationImport = OrganizationImportStatus.create({ organizationId, createdBy: userId });

    await organizationImportRepository.save(organizationImport);
    organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);

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
          dependencies.logger.error(rmError);
        }
      }
      return organizationImport;
    } catch (error) {
      errors.push(error);

      throw error;
    } finally {
      organizationImport.upload({ filename, encoding, errors });
      await organizationImportRepository.save(organizationImport);
    }
  });

  await validateSiecleFileJobRepository.performAsync(
    new ValidateSiecleFileJob({ organizationImportId: organizationImport.id }),
  );
};

export { uploadSiecleFile };
