import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { validateCsvOrganizationImportFileJobRepository as injectedValidateCsvOrganizationImportFileJobRepository } from '../../infrastructure/repositories/jobs/validate-csv-organization-learners-import-file-job-repository.js';
import * as injectedOrganizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
import { importStorage as injectedImportStorage } from '../../infrastructure/storage/import-storage.js';
import { OrganizationImportStatus } from '../models/OrganizationImportStatus.js';
import { ValidateCsvOrganizationImportFileJob } from '../models/ValidateCsvOrganizationImportFileJob.js';

const uploadCsvFile = withTransaction(async function ({
  payload,
  userId,
  organizationId,
  type,
  i18n,
  organizationImportRepository = injectedOrganizationImportRepository,
  validateCsvOrganizationImportFileJobRepository = injectedValidateCsvOrganizationImportFileJobRepository,
  importStorage = injectedImportStorage,
  Parser,
} = {}) {
  const organizationImportInstance = OrganizationImportStatus.create({ organizationId, createdBy: userId });
  await organizationImportRepository.save(organizationImportInstance);

  const organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);

  let filename;
  let encoding;
  const errors = [];

  // Sending File
  try {
    filename = await importStorage.sendFile({ filepath: payload.path });

    const parserEncoding = await importStorage.getParser({ Parser, filename }, organizationId, i18n);
    encoding = parserEncoding.getFileEncoding();

    if (type) {
      await validateCsvOrganizationImportFileJobRepository.performAsync(
        new ValidateCsvOrganizationImportFileJob({
          organizationImportId: organizationImport.id,
          type,
          locale: i18n.getLocale(),
        }),
      );
    }

    return organizationImport.id;
  } catch (error) {
    errors.push(error);
    throw error;
  } finally {
    organizationImport.upload({ filename, encoding, errors });
    await organizationImportRepository.save(organizationImport);
  }
});

export { uploadCsvFile };
