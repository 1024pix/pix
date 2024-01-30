import { SiecleParser } from '../../infrastructure/serializers/xml/siecle-parser.js';

export { extractOrganizationLearnersInformationFromSIECLE };

async function extractOrganizationLearnersInformationFromSIECLE(path, organization, importStorage) {
  const parser = new SiecleParser(organization, path, importStorage);

  return parser.parse();
}
