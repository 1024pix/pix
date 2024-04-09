import { createReadStream } from 'node:fs';

import { SupOrganizationLearnerParser } from '../../infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { getDataBuffer } from '../../infrastructure/utils/bufferize/get-data-buffer.js';
import { AggregateImportError } from '../errors.js';
import { OrganizationImport } from '../models/OrganizationImport.js';

const importSupOrganizationLearners = async function ({
  payload,
  userId,
  organizationId,
  i18n,
  supOrganizationLearnerRepository,
  organizationImportRepository,
  importStorage,
  dependencies = { createReadStream },
}) {
  let organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });
  let filename;
  let encoding;
  const errors = [];
  let learnersData, warningsData;

  // Sending File
  try {
    filename = await importStorage.sendFile({ filepath: payload.path });

    const readableStreamEncoding = dependencies.createReadStream(payload.path);
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

  // Reading File
  try {
    const readableStream = await importStorage.readFile({ filename });

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
    organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
    organizationImport.validate({ errors, warnings: warningsData });
    await organizationImportRepository.save(organizationImport);
    await importStorage.deleteFile({ filename });
  }

  // Insert Data
  try {
    await supOrganizationLearnerRepository.addStudents(learnersData);

    return warningsData;
  } catch (error) {
    errors.push(error);
    throw error;
  } finally {
    organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
    organizationImport.process({ errors });
    await organizationImportRepository.save(organizationImport);
  }
};

export { importSupOrganizationLearners };
