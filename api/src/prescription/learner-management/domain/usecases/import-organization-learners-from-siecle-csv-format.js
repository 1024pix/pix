import { SiecleXmlImportError } from '../errors.js';

const { isEmpty, chunk } = lodash;
import bluebird from 'bluebird';
import lodash from 'lodash';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../shared/infrastructure/constants.js';

const ERRORS = {
  EMPTY: 'EMPTY',
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
};

const importOrganizationLearnersFromSIECLECSVFormat = async function ({
  organizationId,
  payload,
  organizationLearnersCsvService,
  organizationLearnerRepository,
  organizationRepository,
  importStorage,
  i18n,
}) {
  let organizationLearnerData = [];
  const organization = await organizationRepository.get(organizationId);

  const filename = await importStorage.sendFile({ filepath: payload.path });
  try {
    const readableStream = await importStorage.readFile({ filename });
    organizationLearnerData = await organizationLearnersCsvService.extractOrganizationLearnersInformation(
      readableStream,
      organization,
      i18n,
    );
  } finally {
    await importStorage.deleteFile({ filename });
  }

  if (isEmpty(organizationLearnerData)) {
    throw new SiecleXmlImportError(ERRORS.EMPTY);
  }

  const organizationLearnersChunks = chunk(organizationLearnerData, ORGANIZATION_LEARNER_CHUNK_SIZE);

  const nationalStudentIdData = organizationLearnerData.map((learner) => learner.nationalStudentId, []);

  return DomainTransaction.execute(async (domainTransaction) => {
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
  });
};

export { importOrganizationLearnersFromSIECLECSVFormat };
