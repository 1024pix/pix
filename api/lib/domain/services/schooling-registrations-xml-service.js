const XMLStreamer = require('../../infrastructure/utils/xml/xml-streamer');
const SiecleParser = require('../../infrastructure/serializers/xml/siecle-parser');

module.exports = {
  extractSchoolingRegistrationsInformationFromSIECLE,
};

async function extractSchoolingRegistrationsInformationFromSIECLE(path, organization) {
  const xmlStreamer = await XMLStreamer.create(path);
  const parser = new SiecleParser(organization, xmlStreamer);

  return parser.parse();
}
