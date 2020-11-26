const SiecleFileStreamer = require('../../infrastructure/utils/xml/siecle-file-streamer');
const SiecleParser = require('../../infrastructure/serializers/xml/siecle-parser');

module.exports = {
  extractSchoolingRegistrationsInformationFromSIECLE,
};

async function extractSchoolingRegistrationsInformationFromSIECLE(path, organization) {
  const siecleFileStreamer = await SiecleFileStreamer.create(path);
  const parser = new SiecleParser(organization, siecleFileStreamer);

  return parser.parse();
}
