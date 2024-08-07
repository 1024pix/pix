import fs from 'node:fs/promises';

import { logErrorWithCorrelationIds } from '../../../../../lib/infrastructure/monitoring-tools.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { detectEncoding } from '../../infrastructure/utils/xml/detect-encoding.js';
import * as zip from '../../infrastructure/utils/xml/zip.js';
import { FileUploaded } from '../events/FileUploaded.js';
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
  eventBus,
  dependencies = { logErrorWithCorrelationIds },
}) {
  await DomainTransaction.execute(async (domainTransaction) => {
    let organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });

    await organizationImportRepository.save(organizationImport);
    organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);

    const path = payload.path;

    let filename, encoding, event;
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
      event = FileUploaded.create({ organizationImportId: organizationImport.id });
      await eventBus.publish(event, domainTransaction);
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
