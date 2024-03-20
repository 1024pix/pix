import { SiecleXmlImportError } from '../errors.js';

const { isEmpty, chunk } = lodash;
import bluebird from 'bluebird';
import { createReadStream } from 'fs';
import lodash from 'lodash';

import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../shared/infrastructure/constants.js';
import { OrganizationLearnerParser } from '../../infrastructure/serializers/csv/organization-learner-parser.js';
import { OrganizationImport } from '../models/OrganizationImport.js';

const ERRORS = {
  EMPTY: 'EMPTY',
};

const importOrganizationLearnersFromSIECLECSVFormat = async function ({
  userId,
  organizationId,
  payload,
  organizationLearnerRepository,
  organizationRepository,
  organizationImportRepository,
  importStorage,
  i18n,
  dependencies = { createReadStream },
}) {
  let organizationLearnerData = [];

  const organization = await organizationRepository.get(organizationId);
  let organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });

  let filename;
  const errors = [];
  let encoding;
  try {
    filename = await importStorage.sendFile({ filepath: payload.path });
    const readableStreamEncoding = dependencies.createReadStream(payload.path);
    const bufferEncoding = await getDataBuffer(readableStreamEncoding);
    const parserEncoding = OrganizationLearnerParser.buildParser(bufferEncoding, organization.id, i18n);
    encoding = parserEncoding.getFileEncoding();
  } catch (error) {
    errors.push(error);
    throw error;
  } finally {
    organizationImport.upload({ filename, encoding, errors });
    await organizationImportRepository.save(organizationImport);
  }

  try {
    organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);

    const readableStream = await importStorage.readFile({ filename });
    const buffer = await getDataBuffer(readableStream);
    const parser = OrganizationLearnerParser.buildParser(buffer, organization.id, i18n);
    const result = parser.parse(organizationImport.encoding);
    organizationLearnerData = result.learners;
    if (isEmpty(organizationLearnerData)) {
      throw new SiecleXmlImportError(ERRORS.EMPTY);
    }
  } catch (error) {
    errors.push(error);
    throw error;
  } finally {
    organizationImport.validate({ errors });
    await organizationImportRepository.save(organizationImport);
    await importStorage.deleteFile({ filename });
  }

  return DomainTransaction.execute(async (domainTransaction) => {
    try {
      organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);

      const organizationLearnersChunks = chunk(organizationLearnerData, ORGANIZATION_LEARNER_CHUNK_SIZE);
      const nationalStudentIdData = organizationLearnerData.map((learner) => learner.nationalStudentId, []);

      await organizationLearnerRepository.disableAllOrganizationLearnersInOrganization({
        domainTransaction,
        organizationId,
        nationalStudentIds: nationalStudentIdData,
      });

      await bluebird.mapSeries(organizationLearnersChunks, (chunk) => {
        return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
          chunk,
          organizationId,
          domainTransaction,
        );
      });
    } catch (error) {
      errors.push(error);
      throw error;
    } finally {
      organizationImport.process({ errors });
      await organizationImportRepository.save(organizationImport);
    }
  });
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

export { importOrganizationLearnersFromSIECLECSVFormat };
