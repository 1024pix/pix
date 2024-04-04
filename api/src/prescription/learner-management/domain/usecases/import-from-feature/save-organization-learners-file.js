import { CommonCsvLearnerParser } from '../../../infrastructure/serializers/csv/common-csv-learner-parser.js';
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

    const learners = parser.parse(organizationImport.encoding);

    const learnerSet = ImportOrganizationLearnerSet.buildSet({
      organizationId,
      importFormat,
    });

    learnerSet.addLearners(learners);

    await organizationLearnerRepository.disableCommonOrganizationLearnersFromOrganizationId(organizationId);
    await organizationLearnerRepository.saveCommonOrganizationLearners(learnerSet.learners);
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

function getDataBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data);
    });
    readableStream.on('error', (err) => reject(err));
    readableStream.once('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

export { saveOrganizationLearnersFile };
