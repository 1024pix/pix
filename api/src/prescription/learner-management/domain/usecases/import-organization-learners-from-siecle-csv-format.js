const { chunk } = lodash;

import lodash from 'lodash';

import { withTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../shared/infrastructure/constants.js';
import * as injectedOrganizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import { OrganizationLearnerParser } from '../../infrastructure/serializers/csv/organization-learner-parser.js';
import { importStorage as injectedImportStorage } from '../../infrastructure/storage/import-storage.js';

const importOrganizationLearnersFromSIECLECSVFormat = withTransaction(async function ({
  organizationImportId,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
  organizationImportRepository = injectedOrganizationImportRepository,
  importStorage = injectedImportStorage,
  i18n,
  chunkLength = ORGANIZATION_LEARNER_CHUNK_SIZE,
} = {}) {
  let organizationImport;
  const errors = [];
  try {
    organizationImport = await organizationImportRepository.get(organizationImportId);
    const organizationId = organizationImport.organizationId;

    const parser = await importStorage.getParser(
      {
        Parser: OrganizationLearnerParser,
        filename: organizationImport.filename,
      },
      organizationId,
      i18n,
    );
    const result = parser.parse(organizationImport.encoding);
    const organizationLearnerData = result.learners;

    const organizationLearnersChunks = chunk(organizationLearnerData, chunkLength);
    const nationalStudentIdData = organizationLearnerData.map((learner) => learner.nationalStudentId, []);

    await organizationLearnerRepository.disableAllOrganizationLearnersInOrganization({
      organizationId,
      nationalStudentIds: nationalStudentIdData,
    });

    for (const chunk of organizationLearnersChunks) {
      await organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(chunk, organizationId);
    }
  } catch (error) {
    errors.push(error);
    throw error;
  } finally {
    organizationImport.process({ errors });
    await organizationImportRepository.save(organizationImport);
    await importStorage.deleteFile({ filename: organizationImport.filename });
  }
});

export { importOrganizationLearnersFromSIECLECSVFormat };
