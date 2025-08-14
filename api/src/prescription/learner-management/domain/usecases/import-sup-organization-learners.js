import * as injectedOrganizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
import * as injectedSupOrganizationLearnerRepository from '../../infrastructure/repositories/sup-organization-learner-repository.js';
import { SupOrganizationLearnerParser } from '../../infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { importStorage as injectedImportStorage } from '../../infrastructure/storage/import-storage.js';
import { getDataBuffer } from '../../infrastructure/utils/bufferize/get-data-buffer.js';
import { AggregateImportError } from '../errors.js';

const importSupOrganizationLearners = async function ({
  organizationImportId,
  i18n,
  supOrganizationLearnerRepository = injectedSupOrganizationLearnerRepository,
  organizationImportRepository = injectedOrganizationImportRepository,
  importStorage = injectedImportStorage,
} = {}) {
  const organizationImport = await organizationImportRepository.get(organizationImportId);
  const errors = [];

  // Reading File
  try {
    const readableStream = await importStorage.readFile({ filename: organizationImport.filename });

    const buffer = await getDataBuffer(readableStream);
    const parser = SupOrganizationLearnerParser.buildParser(buffer, organizationImport.organizationId, i18n);

    const { learners } = parser.parse(parser.getFileEncoding());

    await supOrganizationLearnerRepository.addStudents(learners);
  } catch (error) {
    if (error instanceof AggregateImportError) {
      errors.push(...error.meta);
    } else {
      errors.push(error);
    }
    throw error;
  } finally {
    organizationImport.process({ errors });
    await organizationImportRepository.save(organizationImport);
    await importStorage.deleteFile({ filename: organizationImport.filename });
  }
};

export { importSupOrganizationLearners };
