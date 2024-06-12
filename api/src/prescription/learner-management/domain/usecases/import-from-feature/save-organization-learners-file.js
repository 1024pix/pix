import { CommonCsvLearnerParser } from '../../../infrastructure/serializers/csv/common-csv-learner-parser.js';
import { getDataBuffer } from '../../../infrastructure/utils/bufferize/get-data-buffer.js';
import { AggregateImportError } from '../../errors.js';
import { ImportOrganizationLearnerSet } from '../../models/ImportOrganizationLearnerSet.js';

const saveOrganizationLearnersFile = async function ({
  organizationId,
  organizationLearnerImportFormatRepository,
  organizationLearnerRepository,
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

    const learnersData = parser.parse(organizationImport.encoding);

    const learnerSet = ImportOrganizationLearnerSet.buildSet({
      organizationId,
      importFormat,
    });

    learnerSet.addLearners(learnersData);

    const existingLearners = await organizationLearnerRepository.findAllCommonLearnersFromOrganizationId({
      organizationId,
    });

    learnerSet.setExistingLearners(existingLearners);

    const learners = learnerSet.learners;

    await organizationLearnerRepository.disableCommonOrganizationLearnersFromOrganizationId({
      organizationId,
      excludeOrganizationLearnerIds: learners.existinglearnerIds,
    });
    await organizationLearnerRepository.updateCommonLearnersFromOrganizationId({
      organizationId,
      learners: learners.update,
    });
    await organizationLearnerRepository.saveCommonOrganizationLearners(learners.create);
  } catch (error) {
    if (Array.isArray(error)) {
      errors.push(...error);
    } else {
      errors.push(error);
    }
    throw new AggregateImportError(errors);
  } finally {
    organizationImport.process({ errors });
    await organizationImportRepository.save(organizationImport);
    await importStorage.deleteFile({ filename: organizationImport.filename });
  }
};

export { saveOrganizationLearnersFile };
