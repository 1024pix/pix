const fs = require('fs').promises;
const OrganizationLearnerParser = require('../../infrastructure/serializers/csv/organization-learner-parser.js');

module.exports = {
  extractOrganizationLearnersInformation,
};

async function extractOrganizationLearnersInformation(path, organization, i18n) {
  const buffer = await fs.readFile(path);
  const parser = OrganizationLearnerParser.buildParser(buffer, organization.id, i18n);
  return parser.parse().learners;
}
