import { SupOrganizationLearnerParser } from '../../infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { getDataBuffer } from '../../infrastructure/utils/bufferize/get-data-buffer.js';
import { AggregateImportError } from '../errors.js';

const importSupOrganizationLearners = async function ({
  organizationId,
  i18n,
  supOrganizationLearnerRepository,
  organizationImportRepository,
  importStorage,
}) {
  let organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
  const errors = [];
  let learnersData, warningsData;

  // Reading File
  try {
    const readableStream = await importStorage.readFile({ filename: organizationImport.filename });

    const buffer = await getDataBuffer(readableStream);
    const parser = SupOrganizationLearnerParser.create(buffer, organizationId, i18n);

    const { learners, warnings } = parser.parse(parser.getFileEncoding());

    learnersData = learners;
    warningsData = warnings;
  } catch (error) {
    if (error instanceof AggregateImportError) {
      errors.push(...error.meta);
    } else {
      errors.push(error);
    }
    throw error;
  } finally {
    organizationImport.validate({ errors, warnings: warningsData });
    await organizationImportRepository.save(organizationImport);
    await importStorage.deleteFile({ filename: organizationImport.filename });
  }

  // Insert Data
  organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);

  try {
    await supOrganizationLearnerRepository.addStudents(learnersData);

    return warningsData;
  } catch (error) {
    errors.push(error);
    throw error;
  } finally {
    organizationImport.process({ errors });
    await organizationImportRepository.save(organizationImport);
  }
};

export { importSupOrganizationLearners };
