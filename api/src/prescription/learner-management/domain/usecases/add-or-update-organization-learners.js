import lodash from 'lodash';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../shared/infrastructure/constants.js';
import { logger as injectedLogger } from '../../../../shared/infrastructure/utils/logger.js';
import * as injectedOrganizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import { SiecleParser } from '../../infrastructure/serializers/xml/siecle-parser.js';
import { importStorage as injectedImportStorage } from '../../infrastructure/storage/import-storage.js';
import { SiecleFileStreamer } from '../../infrastructure/utils/xml/siecle-file-streamer.js';

const { chunk } = lodash;

async function addOrUpdateOrganizationLearners({
  organizationImportId,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
  organizationImportRepository = injectedOrganizationImportRepository,
  importStorage = injectedImportStorage,
  logger = injectedLogger,
  chunkSize = ORGANIZATION_LEARNER_CHUNK_SIZE,
} = {}) {
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

      for (const chunk of organizationLearnersChunks) {
        await organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
          chunk,
          organizationImport.organizationId,
        );
      }
    } catch (error) {
      errors.push(error);
      throw error;
    } finally {
      organizationImport.process({ errors });
      await organizationImportRepository.save(organizationImport);
      try {
        await importStorage.deleteFile({ filename: organizationImport.filename });
      } catch (error) {
        logger.error(error);
      }
    }
  });
}

export { addOrUpdateOrganizationLearners };
