import * as injectedOrganizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
import * as injectedSupOrganizationLearnerRepository from '../../infrastructure/repositories/sup-organization-learner-repository.js';
import { SupOrganizationLearnerParser } from '../../infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { importStorage as injectedImportStorage } from '../../infrastructure/storage/import-storage.js';
import { getDataBuffer } from '../../infrastructure/utils/bufferize/get-data-buffer.js';

const getDeltaOrganizationLearnerIds = async function ({
  organizationImportId,
  i18n,
  supOrganizationLearnerRepository = injectedSupOrganizationLearnerRepository,
  organizationImportRepository = injectedOrganizationImportRepository,
  importStorage = injectedImportStorage,
} = {}) {
  const organizationImport = await organizationImportRepository.get(organizationImportId);

  const readableStream = await importStorage.readFile({ filename: organizationImport.filename });
  const buffer = await getDataBuffer(readableStream);
  const parser = SupOrganizationLearnerParser.buildParser(buffer, organizationImport.organizationId, i18n);

  const { learners } = parser.parse(parser.getFileEncoding());

  return supOrganizationLearnerRepository.getOrganizationLearnerIdsNotInList({
    organizationId: organizationImport.organizationId,
    studentNumberList: learners.map((learner) => learner.studentNumber),
  });
};

export { getDeltaOrganizationLearnerIds };
