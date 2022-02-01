const fs = require('fs').promises;
const SchoolingRegistrationParser = require('../../infrastructure/serializers/csv/schooling-registration-parser');

module.exports = {
  extractSchoolingRegistrationsInformation,
};

async function extractSchoolingRegistrationsInformation(path, organization, i18n) {
  const buffer = await fs.readFile(path);
  const parser = SchoolingRegistrationParser.buildParser(buffer, organization.id, i18n);
  return parser.parse().registrations;
}
