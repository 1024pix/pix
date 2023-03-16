import fs from 'fs';

const { promises } = fs;

import { OrganizationLearnerParser } from '../../infrastructure/serializers/csv/organization-learner-parser.js';

export { extractOrganizationLearnersInformation };

async function extractOrganizationLearnersInformation(path, organization, i18n) {
  const buffer = await fs.readFile(path);
  const parser = OrganizationLearnerParser.buildParser(buffer, organization.id, i18n);
  return parser.parse().learners;
}
