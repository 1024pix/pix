import { SupOrganizationLearnerParser } from '../../infrastructure/serializers/csv/sup-organization-learner-parser.js';

const replaceSupOrganizationLearners = async function ({
  payload,
  organizationId,
  i18n,
  userId,
  supOrganizationLearnerRepository,
  importStorage,
  dependencies = { getDataBuffer },
}) {
  const filename = await importStorage.sendFile({ filepath: payload.path });

  try {
    const readableStream = await importStorage.readFile({ filename });
    const buffer = await dependencies.getDataBuffer(readableStream);
    const parser = SupOrganizationLearnerParser.create(buffer, organizationId, i18n);

    const { learners, warnings } = parser.parse(parser.getFileEncoding());

    await supOrganizationLearnerRepository.replaceStudents(organizationId, learners, userId);

    return warnings;
  } finally {
    await importStorage.deleteFile({ filename });
  }
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
