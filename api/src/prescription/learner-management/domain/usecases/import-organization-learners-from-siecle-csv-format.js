import { SiecleXmlImportError } from '../errors.js';

const { isEmpty, chunk } = lodash;
import fs from 'fs';
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
  i18n,
}) {
  const organization = await organizationRepository.get(organizationId);
  const readableStream = fs.createReadStream(payload.path);

  const organizationLearnerData = await organizationLearnersCsvService.extractOrganizationLearnersInformation(
    readableStream,
    organization,
    i18n,
  );

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
