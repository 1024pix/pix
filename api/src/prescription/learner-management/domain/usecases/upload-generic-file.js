import { createReadStream } from 'node:fs';

import { GenericParser } from '../../infrastructure/serializers/csv/parsers/generic-parser.js';
import { getDataBuffer } from '../../infrastructure/utils/bufferize/get-data-buffer.js';
import { AggregateImportError, OrganizationLearnerImportFormatNotFoundError } from '../errors.js';
import { ValidateGenericFileJob } from '../models/jobs/ValidateGenericFileJob.js';
import { OrganizationImportStatus } from '../models/OrganizationImportStatus.js';

const uploadGenericFile = async function ({
  payload,
  userId,
  organizationId,
  organizationLearnerImportFormatRepository,
  validateGenericFileJobRepository,
  organizationImportRepository,
  importStorage,
  dependencies = { createReadStream, getDataBuffer },
}) {
  let organizationImport = OrganizationImportStatus.create({ organizationId, createdBy: userId });
  let filename;
  let encoding;
  const errors = [];

  // Sending File
  try {
    const organizationLearnerImportFormat = await organizationLearnerImportFormatRepository.get(organizationId);
    if (organizationLearnerImportFormat === null)
      throw new OrganizationLearnerImportFormatNotFoundError(organizationId);

    await organizationImportRepository.save(organizationImport);

    organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);

    const readableStreamEncoding = dependencies.createReadStream(payload.path);
    const bufferEncoding = await dependencies.getDataBuffer(readableStreamEncoding);

    const parser = GenericParser.buildParser({
      buffer: bufferEncoding,
      importFormat: organizationLearnerImportFormat,
    });

    encoding = parser.getEncoding();

    filename = await importStorage.sendFile({ filepath: payload.path });
    await validateGenericFileJobRepository.performAsync(
      new ValidateGenericFileJob({ organizationImportId: organizationImport.id }),
    );
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

export { uploadGenericFile };
