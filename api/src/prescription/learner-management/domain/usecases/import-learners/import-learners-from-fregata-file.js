import lodash from 'lodash';

import { withTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../../shared/infrastructure/constants.js';
import { FregataParser } from '../../../infrastructure/serializers/csv/parsers/fregata-parser.js';
import { ScoOrganizationLearnerSet } from '../../models/ScoOrganizationLearnerSet.js';

const { chunk } = lodash;

const importLearnersFromFregataFile = withTransaction(async function ({
  organizationImportId,
  organizationLearnerRepository,
  studentRepository,
  organizationImportRepository,
  importStorage,
  i18n,
  chunkLength = ORGANIZATION_LEARNER_CHUNK_SIZE,
}) {
  let organizationImport;
  const errors = [];
  try {
    organizationImport = await organizationImportRepository.get(organizationImportId);
    const organizationId = organizationImport.organizationId;

    const parser = await importStorage.getParser(
      {
        Parser: FregataParser,
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

    const existingOrganizationLearners = await organizationLearnerRepository.findByOrganizationId({ organizationId });
    const reconciledStudents = await studentRepository.findReconciledStudentsByNationalStudentId(
      nationalStudentIdData.filter(Boolean),
    );

    for (const chunk of organizationLearnersChunks) {
      const scoLearnerSet = new ScoOrganizationLearnerSet(chunk);
      const learnersToSave = scoLearnerSet.reconcile(reconciledStudents, existingOrganizationLearners);
      await organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(learnersToSave);
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

export { importLearnersFromFregataFile };
