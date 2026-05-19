import lodash from 'lodash';

import { DomainTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../../shared/infrastructure/constants.js';
import { SiecleParser } from '../../../infrastructure/serializers/xml/siecle-parser.js';
import { SiecleFileStreamer } from '../../../infrastructure/utils/xml/siecle-file-streamer.js';
import { OrganizationLearner } from '../../models/OrganizationLearner.js';
import { ScoOrganizationLearnerSet } from '../../models/ScoOrganizationLearnerSet.js';

const { chunk } = lodash;

async function importLearnersFromSiecleFile({
  organizationImportId,
  organizationLearnerRepository,
  studentRepository,
  organizationImportRepository,
  importStorage,
  logger,
  chunkSize = ORGANIZATION_LEARNER_CHUNK_SIZE,
}) {
  const errors = [];
  const organizationImport = await organizationImportRepository.get(organizationImportId);

  return DomainTransaction.execute(async () => {
    try {
      const readableStream = await importStorage.readFile({ filename: organizationImport.filename });

      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream, organizationImport.encoding);

      const parser = SiecleParser.create(siecleFileStreamer);

      const organizationLearnerData = await parser.parse();

      const organizationId = organizationImport.organizationId;
      const organizationLearnersChunks = chunk(organizationLearnerData, chunkSize);

      const nationalStudentIdData = organizationLearnerData.map((learner) => learner.nationalStudentId);

      await organizationLearnerRepository.disableAllOrganizationLearnersInOrganization({
        organizationId,
        nationalStudentIds: nationalStudentIdData,
      });

      const existingOrganizationLearners = await organizationLearnerRepository.findByOrganizationId({ organizationId });
      const reconciledStudents = await studentRepository.findReconciledStudentsByNationalStudentId(
        nationalStudentIdData.filter(Boolean),
      );

      for (const chunk of organizationLearnersChunks) {
        const organizationLearnersFromChunk = chunk.map((data) => new OrganizationLearner({ ...data, organizationId }));
        const scoLearnerSet = new ScoOrganizationLearnerSet(organizationLearnersFromChunk);
        const learnersToSave = scoLearnerSet.reconcile(reconciledStudents, existingOrganizationLearners);
        await organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(learnersToSave);
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

export { importLearnersFromSiecleFile };
