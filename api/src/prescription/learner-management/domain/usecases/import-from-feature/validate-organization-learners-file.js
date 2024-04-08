import { CommonCsvLearnerParser } from '../../../infrastructure/serializers/csv/common-csv-learner-parser.js';
import { getDataBuffer } from '../../../infrastructure/utils/bufferize/get-data-buffer.js';
import { AggregateImportError } from '../../errors.js';
import { ImportOrganizationLearnerSet } from '../../models/ImportOrganizationLearnerSet.js';

const validateOrganizationLearnersFile = async function ({
  organizationId,
  organizationLearnerImportFormatRepository,
  organizationImportRepository,
  importStorage,
  dependencies = { getDataBuffer },
}) {
  const errors = [];

  const organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
  try {
    const importFormat = await organizationLearnerImportFormatRepository.get(organizationId);

    const readableStream = await importStorage.readFile({ filename: organizationImport.filename });
    const buffer = await dependencies.getDataBuffer(readableStream);

    const parser = CommonCsvLearnerParser.buildParser({ buffer, importFormat });

    const learners = parser.parse(organizationImport.encoding);

    const learnerSet = ImportOrganizationLearnerSet.buildSet({
      organizationId,
      importFormat,
    });

    learnerSet.addLearners(learners);
  } catch (error) {
    if (Array.isArray(error)) {
      errors.push(...error);
    } else {
      errors.push(error);
    }
    await importStorage.deleteFile({ filename: organizationImport.filename });

    throw new AggregateImportError(errors);
  } finally {
    organizationImport.validate({ errors });
    await organizationImportRepository.save(organizationImport);
  }
};

export { validateOrganizationLearnersFile };
