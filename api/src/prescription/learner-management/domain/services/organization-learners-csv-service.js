import { OrganizationLearnerParser } from '../../infrastructure/serializers/csv/organization-learner-parser.js';
export { extractOrganizationLearnersInformation };

async function extractOrganizationLearnersInformation(readableStream, organization, i18n) {
  const dataPromise = new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data);
    });
    readableStream.on('error', (err) => reject(err));
    readableStream.once('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
  const data = await dataPromise;
  const parser = OrganizationLearnerParser.buildParser(data, organization.id, i18n);
  return parser.parse().learners;
}
