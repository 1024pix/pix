import { SupParser } from '../../../infrastructure/serializers/csv/parsers/sup-parser.js';
import { getDataBuffer } from '../../../infrastructure/utils/bufferize/get-data-buffer.js';
import { AggregateImportError } from '../../errors.js';

const importLearnersFromSupFile = async function ({
  organizationImportId,
  i18n,
  supOrganizationLearnerRepository,
  organizationImportRepository,
  importStorage,
}) {
  const organizationImport = await organizationImportRepository.get(organizationImportId);
  const errors = [];

  // Reading File
  try {
    const readableStream = await importStorage.readFile({ filename: organizationImport.filename });

    const buffer = await getDataBuffer(readableStream);
    const parser = SupParser.buildParser(buffer, organizationImport.organizationId, i18n);

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
    if (errors.length === 0) {
      await importStorage.deleteFile({ filename: organizationImport.filename });
    }
  }
};

export { importLearnersFromSupFile };
