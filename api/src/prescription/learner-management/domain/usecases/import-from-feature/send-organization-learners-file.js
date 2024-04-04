import { createReadStream } from 'fs';

import { CommonCsvLearnerParser } from '../../../infrastructure/serializers/csv/common-csv-learner-parser.js';
import { AggregateImportError, OrganizationLearnerImportFormatNotFoundError } from '../../errors.js';
import { OrganizationImport } from '../../models/OrganizationImport.js';

const sendOrganizationLearnersFile = async function ({
  payload,
  userId,
  organizationId,
  organizationLearnerImportFormatRepository,
  organizationImportRepository,
  importStorage,
  dependencies = { createReadStream, getDataBuffer },
}) {
  const organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });
  let filename;
  let encoding;
  const errors = [];

  // Sending File
  try {
    const organizationLearnerImportFormat = await organizationLearnerImportFormatRepository.get(organizationId);
    if (organizationLearnerImportFormat === null)
      throw new OrganizationLearnerImportFormatNotFoundError(organizationId);

    const readableStreamEncoding = dependencies.createReadStream(payload.path);
    const bufferEncoding = await dependencies.getDataBuffer(readableStreamEncoding);

    const parser = CommonCsvLearnerParser.buildParser({
      buffer: bufferEncoding,
      importFormat: organizationLearnerImportFormat,
    });

    encoding = parser.getEncoding();

    filename = await importStorage.sendFile({ filepath: payload.path });
  } catch (error) {
    if (Array.isArray(error)) {
      errors.push(...error);
    } else {
      errors.push(error);
    }

    throw new AggregateImportError(errors);
  } finally {
    try {
      organizationImport.upload({ filename, encoding, errors });
      await organizationImportRepository.save(organizationImport);
    } catch {
      if (filename) await importStorage.deleteFile({ filename });
    }
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

export { sendOrganizationLearnersFile };
