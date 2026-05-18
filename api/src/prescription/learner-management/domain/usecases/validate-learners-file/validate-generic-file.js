import { GenericParser } from '../../../infrastructure/serializers/csv/parsers/generic-parser.js';
import { getDataBuffer } from '../../../infrastructure/utils/bufferize/get-data-buffer.js';
import { AggregateImportError } from '../../errors.js';
import { GenericOrganizationLearnerSet } from '../../models/GenericOrganizationLearnerSet.js';
import { ImportFromGenericFileJob } from '../../models/jobs/ImportFromGenericFileJob.js';

const validateGenericFile = async function ({
  organizationImportId,
  organizationLearnerImportFormatRepository,
  importFromGenericFileJobRepository,
  organizationImportRepository,
  importStorage,
  dependencies = { getDataBuffer },
}) {
  const errors = [];

  const organizationImport = await organizationImportRepository.get(organizationImportId);
  try {
    const organizationId = organizationImport.organizationId;
    const importFormat = await organizationLearnerImportFormatRepository.get(organizationId);

    const readableStream = await importStorage.readFile({ filename: organizationImport.filename });
    const buffer = await dependencies.getDataBuffer(readableStream);

    const parser = GenericParser.buildParser({ buffer, importFormat });

    const learners = parser.parse(organizationImport.encoding);

    const learnerSet = GenericOrganizationLearnerSet.buildSet({
      organizationId,
      importFormat,
    });

    learnerSet.addLearners(learners);
    await importFromGenericFileJobRepository.performAsync(new ImportFromGenericFileJob({ organizationImportId }));
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

export { validateGenericFile };
