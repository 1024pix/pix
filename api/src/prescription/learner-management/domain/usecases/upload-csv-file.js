import { createReadStream } from 'node:fs';

import { SupOrganizationLearnerParser } from '../../infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { getDataBuffer } from '../../infrastructure/utils/bufferize/get-data-buffer.js';
import { OrganizationImport } from '../models/OrganizationImport.js';

const uploadCsvFile = async function ({
  payload,
  userId,
  organizationId,
  i18n,
  organizationImportRepository,
  importStorage,
}) {
  const organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });
  let filename;
  let encoding;
  const errors = [];

  // Sending File
  try {
    filename = await importStorage.sendFile({ filepath: payload.path });

    const readableStreamEncoding = createReadStream(payload.path);
    const bufferEncoding = await getDataBuffer(readableStreamEncoding);
    const parserEncoding = SupOrganizationLearnerParser.create(bufferEncoding, organizationId, i18n);
    encoding = parserEncoding.getFileEncoding();
  } catch (error) {
    errors.push(error);
    throw error;
  } finally {
    organizationImport.upload({ filename, encoding, errors });
    await organizationImportRepository.save(organizationImport);
  }
};

export { uploadCsvFile };
