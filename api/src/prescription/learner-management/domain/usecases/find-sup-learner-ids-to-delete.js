import { SupParser } from '../../infrastructure/serializers/csv/parsers/sup-parser.js';
import { getDataBuffer } from '../../infrastructure/utils/bufferize/get-data-buffer.js';

const findSupLearnerIdsToDelete = async function ({
  organizationImportId,
  i18n,
  supOrganizationLearnerRepository,
  organizationImportRepository,
  importStorage,
}) {
  const organizationImport = await organizationImportRepository.get(organizationImportId);

  const readableStream = await importStorage.readFile({ filename: organizationImport.filename });
  const buffer = await getDataBuffer(readableStream);
  const parser = SupParser.buildParser(buffer, organizationImport.organizationId, i18n);

  const { learners } = parser.parse(parser.getFileEncoding());

  return supOrganizationLearnerRepository.getOrganizationLearnerIdsNotInList({
    organizationId: organizationImport.organizationId,
    studentNumberList: learners.map(({ studentNumber }) => studentNumber),
  });
};

export { findSupLearnerIdsToDelete };
