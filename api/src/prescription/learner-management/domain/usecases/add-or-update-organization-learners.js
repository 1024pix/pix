import bluebird from 'bluebird';
import lodash from 'lodash';

import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../shared/infrastructure/constants.js';
import { SiecleParser } from '../../infrastructure/serializers/xml/siecle-parser.js';
import { SiecleFileStreamer } from '../../infrastructure/utils/xml/siecle-file-streamer.js';

const { chunk } = lodash;

async function addOrUpdateOrganizationLearners({
  organizationImportId,
  organizationLearnerRepository,
  organizationImportRepository,
  importStorage,
  chunkSize = ORGANIZATION_LEARNER_CHUNK_SIZE,
  logErrorWithCorrelationIds,
}) {
  const errors = [];
  const organizationImport = await organizationImportRepository.get(organizationImportId);

  return DomainTransaction.execute(async () => {
    try {
      const readableStream = await importStorage.readFile({ filename: organizationImport.filename });
      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream, organizationImport.encoding);
      const parser = SiecleParser.create(siecleFileStreamer);

      const organizationLearnerData = await parser.parse();

      const organizationLearnersChunks = chunk(organizationLearnerData, chunkSize);

      const nationalStudentIdData = organizationLearnerData.map((learner) => learner.nationalStudentId);

      await organizationLearnerRepository.disableAllOrganizationLearnersInOrganization({
        organizationId: organizationImport.organizationId,
        nationalStudentIds: nationalStudentIdData,
      });

      await bluebird.mapSeries(organizationLearnersChunks, (chunk) => {
        return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
          chunk,
          organizationImport.organizationId,
        );
      });
    } catch (error) {
      errors.push(error);
      throw error;
    } finally {
      organizationImport.process({ errors });
      await organizationImportRepository.save(organizationImport);
      try {
        await importStorage.deleteFile({ filename: organizationImport.filename });
      } catch (e) {
        logErrorWithCorrelationIds(e);
      }
    }
  });
}

export { addOrUpdateOrganizationLearners };
