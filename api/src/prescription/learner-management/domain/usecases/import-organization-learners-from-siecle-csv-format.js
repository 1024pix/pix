import { SiecleXmlImportError } from '../errors.js';

const { isEmpty, chunk } = lodash;
import bluebird from 'bluebird';
import lodash from 'lodash';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../shared/infrastructure/constants.js';
import { OrganizationLearnerParser } from '../../infrastructure/serializers/csv/organization-learner-parser.js';

const ERRORS = {
  EMPTY: 'EMPTY',
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
};

const importOrganizationLearnersFromSIECLECSVFormat = async function ({
  organizationId,
  payload,
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
    const buffer = await getDataBuffer(readableStream);
    const parser = OrganizationLearnerParser.buildParser(buffer, organization.id, i18n);
    const result = parser.parse(parser.getFileEncoding());
    organizationLearnerData = result.learners;
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
