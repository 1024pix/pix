import { SupOrganizationLearnerParser } from '../../infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { getDataBuffer } from '../../infrastructure/utils/bufferize/get-data-buffer.js';
import { AggregateImportError } from '../errors.js';

const replaceSupOrganizationLearners = async function ({
  organizationId,
  i18n,
  supOrganizationLearnerRepository,
  organizationImportRepository,
  importStorage,
}) {
  const errors = [];
  const organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);

  try {
    const readableStream = await importStorage.readFile({ filename: organizationImport.filename });
    const buffer = await getDataBuffer(readableStream);
    const parser = SupOrganizationLearnerParser.create(buffer, organizationId, i18n);

    const { learners } = parser.parse(parser.getFileEncoding());

    await supOrganizationLearnerRepository.replaceStudents(organizationId, learners, organizationImport.createdBy);
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

export { replaceSupOrganizationLearners };
