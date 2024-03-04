import { SupOrganizationLearnerParser } from '../../infrastructure/serializers/csv/sup-organization-learner-parser.js';

const replaceSupOrganizationLearners = async function ({
  readableStream,
  organizationId,
  i18n,
  userId,
  supOrganizationLearnerRepository,
  dependencies = { getDataBuffer },
}) {
  const buffer = await dependencies.getDataBuffer(readableStream);
  const parser = SupOrganizationLearnerParser.create(buffer, organizationId, i18n);

  const { learners, warnings } = parser.parse();

  await supOrganizationLearnerRepository.replaceStudents(organizationId, learners, userId);

  return warnings;
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
export { replaceSupOrganizationLearners };
