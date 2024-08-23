import fs from 'node:fs/promises';

import { logErrorWithCorrelationIds } from '../../../../../lib/infrastructure/monitoring-tools.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { detectEncoding } from '../../infrastructure/utils/xml/detect-encoding.js';
import * as zip from '../../infrastructure/utils/xml/zip.js';
import { ValidateOrganizationImportFileJob } from '../models/jobs/ValidateOrganizationImportFileJob.js';
import { OrganizationImport } from '../models/OrganizationImport.js';

const uploadSiecleFile = async function ({
  userId,
  organizationId,
  payload,
  importStorage,
  organizationImportRepository,
  validateOrganizationImportFileJobRepository,
  siecleService = {
    unzip: zip.unzip,
    detectEncoding,
  },
  dependencies = { logErrorWithCorrelationIds },
}) {
  await DomainTransaction.execute(async () => {
    let organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });

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
          dependencies.logErrorWithCorrelationIds(rmError);
        }
      }
      await validateOrganizationImportFileJobRepository.performAsync(
        new ValidateOrganizationImportFileJob({ organizationImportId: organizationImport.id }),
      );
    } catch (error) {
      errors.push(error);
      throw error;
    } finally {
      organizationImport.upload({ filename, encoding, errors });
      await organizationImportRepository.save(organizationImport);
    }
  });
};

export { uploadSiecleFile };
