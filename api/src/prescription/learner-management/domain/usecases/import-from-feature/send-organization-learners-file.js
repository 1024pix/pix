import { createReadStream } from 'node:fs';

import { CommonCsvLearnerParser } from '../../../infrastructure/serializers/csv/common-csv-learner-parser.js';
import { getDataBuffer } from '../../../infrastructure/utils/bufferize/get-data-buffer.js';
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

export { sendOrganizationLearnersFile };
