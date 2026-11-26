import { GenericParser } from '../../../infrastructure/serializers/csv/parsers/generic-parser.js';
import { AggregateImportError } from '../../errors.js';
import { ImportOrganizationLearnerSet } from '../../models/ImportOrganizationLearnerSet.js';
import { ImportFromGenericFileJob } from '../../models/jobs/ImportFromGenericFileJob.js';

const validateGenericFile = async function ({
  organizationImportId,
  organizationLearnerImportFormatRepository,
  importFromGenericFileJobRepository,
  organizationImportRepository,
  importStorage,
}) {
  const errors = [];

  const organizationImport = await organizationImportRepository.get(organizationImportId);
  try {
    const organizationId = organizationImport.organizationId;
    const importFormat = await organizationLearnerImportFormatRepository.get(organizationId);

    const readableStream = await importStorage.readFile({ filename: organizationImport.filename });

    const parser = GenericParser.buildParser({ importFormat });

    const learnerSet = ImportOrganizationLearnerSet.buildSet({
      organizationId,
      importFormat,
    });

    for await (const learner of parser.parseStream({ readableStream, encoding: organizationImport.encoding })) {
      learnerSet.addLearner(learner);
    }

    learnerSet.throwIfErrors();
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

  await importFromGenericFileJobRepository.performAsync(new ImportFromGenericFileJob({ organizationImportId }));
};

export { validateGenericFile };
