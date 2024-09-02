const { chunk } = lodash;

import lodash from 'lodash';

import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../shared/infrastructure/constants.js';
import { OrganizationLearnerParser } from '../../infrastructure/serializers/csv/organization-learner-parser.js';

const importOrganizationLearnersFromSIECLECSVFormat = async function ({
  organizationId,
  organizationLearnerRepository,
  organizationImportRepository,
  importStorage,
  i18n,
  chunkLength = ORGANIZATION_LEARNER_CHUNK_SIZE,
}) {
  let organizationImport;
  const errors = [];
  return DomainTransaction.execute(async () => {
    try {
      organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);

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
};

export { importOrganizationLearnersFromSIECLECSVFormat };
