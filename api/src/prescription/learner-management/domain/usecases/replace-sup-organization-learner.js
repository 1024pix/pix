import { createReadStream } from 'fs';

import { SupOrganizationLearnerParser } from '../../infrastructure/serializers/csv/sup-organization-learner-parser.js';
import { AggregateImportError } from '../errors.js';
import { OrganizationImport } from '../models/OrganizationImport.js';

const replaceSupOrganizationLearners = async function ({
  payload,
  organizationId,
  i18n,
  userId,
  supOrganizationLearnerRepository,
  organizationImportRepository,
  importStorage,
  dependencies = { createReadStream },
}) {
  let organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });
  let filename, encoding;
  const errors = [];
  let warningsData, learnersData;

  // Send File
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

  // Read File
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
    await supOrganizationLearnerRepository.replaceStudents(organizationId, learnersData, userId);

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
export { replaceSupOrganizationLearners };
