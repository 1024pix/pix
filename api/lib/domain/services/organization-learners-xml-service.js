const SiecleParser = require('../../infrastructure/serializers/xml/siecle-parser');

module.exports = {
  extractOrganizationLearnersInformationFromSIECLE,
};

async function extractOrganizationLearnersInformationFromSIECLE(path, organization) {
  const parser = new SiecleParser(organization, path);

  return parser.parse();
}
