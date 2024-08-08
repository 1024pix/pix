import lodash from 'lodash';

import { AggregateImportError, SiecleXmlImportError } from '../errors.js';

const { isEmpty } = lodash;

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SiecleParser } from '../../infrastructure/serializers/xml/siecle-parser.js';
import { SiecleFileStreamer } from '../../infrastructure/utils/xml/siecle-file-streamer.js';
import { FileValidated } from '../events/FileValidated.js';

const ERRORS = {
  EMPTY: 'EMPTY',
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
};

const validateSiecleXmlFile = async function ({
  organizationImportId,
  organizationRepository,
  organizationImportRepository,
  importStorage,
  eventBus,
  logErrorWithCorrelationIds,
}) {
  await DomainTransaction.execute(async (domainTransaction) => {
    const organizationImport = await organizationImportRepository.get(organizationImportId);

    const organization = await organizationRepository.get(organizationImport.organizationId);

    const errors = [];

    try {
      const readableStreamForUAJ = await importStorage.readFile({ filename: organizationImport.filename });
      const siecleFileStreamerForUAJ = await SiecleFileStreamer.create(
        readableStreamForUAJ,
        organizationImport.encoding,
      );
      const parserForUAJ = SiecleParser.create(siecleFileStreamerForUAJ);
      await parserForUAJ.parseUAJ(organization.externalId);

      const readableStream = await importStorage.readFile({ filename: organizationImport.filename });
      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream, organizationImport.encoding);
      const parser = SiecleParser.create(siecleFileStreamer);
      const organizationLearnerData = await parser.parse();
      if (isEmpty(organizationLearnerData)) {
        throw new SiecleXmlImportError(ERRORS.EMPTY);
      }

      const validatedFileEvent = FileValidated.create({ organizationImportId: organizationImport.id });
      await eventBus.publish(validatedFileEvent, domainTransaction);
    } catch (error) {
      if (error instanceof AggregateImportError) {
        errors.push(...error.meta);
      } else {
        errors.push(error);
      }
      try {
        await importStorage.deleteFile({ filename: organizationImport.filename });
      } catch (e) {
        logErrorWithCorrelationIds(e);
      }
      throw error;
    } finally {
      organizationImport.validate({ errors });
      await organizationImportRepository.save(organizationImport);
    }
  });
};

export { validateSiecleXmlFile };
