import { promises as fs } from 'fs';
import OrganizationLearnerParser from '../../infrastructure/serializers/csv/organization-learner-parser';

export default {
  extractOrganizationLearnersInformation,
};

async function extractOrganizationLearnersInformation(path, organization, i18n) {
  const buffer = await fs.readFile(path);
  const parser = OrganizationLearnerParser.buildParser(buffer, organization.id, i18n);
  return parser.parse().learners;
}
