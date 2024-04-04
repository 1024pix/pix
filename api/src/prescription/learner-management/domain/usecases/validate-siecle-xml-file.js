import { AggregateImportError, SiecleXmlImportError } from '../errors.js';

const { isEmpty } = lodash;

import lodash from 'lodash';

import { SiecleParser } from '../../infrastructure/serializers/xml/siecle-parser.js';
import { SiecleFileStreamer } from '../../infrastructure/utils/xml/siecle-file-streamer.js';

const ERRORS = {
  EMPTY: 'EMPTY',
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
};

const validateSiecleXmlFile = async function ({
  organizationId,
  organizationRepository,
  organizationImportRepository,
  importStorage,
}) {
  const organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);

  const organization = await organizationRepository.get(organizationId);

  const errors = [];

  try {
    const readableStreamForUAJ = await importStorage.readFile({ filename: organizationImport.filename });
    const siecleFileStreamerForUAJ = await SiecleFileStreamer.create(readableStreamForUAJ, organizationImport.encoding);
    const parserForUAJ = SiecleParser.create(siecleFileStreamerForUAJ);
    await parserForUAJ.parseUAJ(organization.externalId);

    const readableStream = await importStorage.readFile({ filename: organizationImport.filename });
    const siecleFileStreamer = await SiecleFileStreamer.create(readableStream, organizationImport.encoding);
    const parser = SiecleParser.create(siecleFileStreamer);
    const organizationLearnerData = await parser.parse();
    if (isEmpty(organizationLearnerData)) {
      throw new SiecleXmlImportError(ERRORS.EMPTY);
    }
  } catch (error) {
    if (error instanceof AggregateImportError) {
      errors.push(...error.meta);
    } else {
      errors.push(error);
    }
    await importStorage.deleteFile({ filename: organizationImport.filename });
    throw error;
  } finally {
    organizationImport.validate({ errors });
    await organizationImportRepository.save(organizationImport);
  }
};

export { validateSiecleXmlFile };
