const fs = require('fs').promises;
const SchoolingRegistrationParser = require('../../infrastructure/serializers/csv/schooling-registration-parser');

module.exports = {
  extractSchoolingRegistrationsInformation,
};

async function extractSchoolingRegistrationsInformation(path, organization, i18n) {
  const buffer = await fs.readFile(path);
  const organizationId = organization.id;
  const parser = SchoolingRegistrationParser.buildParser(buffer, organizationId, i18n, organization.isAgriculture);
  return parser.parse().registrations;
}
