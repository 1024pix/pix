const SiecleParser = require('../../infrastructure/serializers/xml/siecle-parser');

module.exports = {
  extractSchoolingRegistrationsInformationFromSIECLE,
};

function extractSchoolingRegistrationsInformationFromSIECLE(path, organization) {
  const parser = new SiecleParser(organization, path);

  return parser.parse();
}
