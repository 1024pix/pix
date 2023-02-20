import SiecleParser from '../../infrastructure/serializers/xml/siecle-parser';

export default {
  extractOrganizationLearnersInformationFromSIECLE,
};

async function extractOrganizationLearnersInformationFromSIECLE(path, organization) {
  const parser = new SiecleParser(organization, path);

  return parser.parse();
}
