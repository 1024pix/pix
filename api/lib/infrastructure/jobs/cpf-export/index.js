import { injectDependencies } from '../../utils/dependency-injection.js';

import * as cpfCertificationResultRepository from '../../repositories/cpf-certification-result-repository.js';
import * as cpfCertificationXmlExportService from '../../../domain/services/cpf-certification-xml-export-service.js';
import { cpfExternalStorage } from '../../external-storage/cpf-external-storage.js';
import * as mailService from '../../../domain/services/mail-service.js';

const dependencies = {
  cpfCertificationResultRepository,
  cpfCertificationXmlExportService,
  cpfExternalStorage,
  mailService,
};

const cpfExport = injectDependencies(
  {
    planner: require('./handlers/planner.js'),
    createAndUpload: require('./handlers/create-and-upload.js'),
    sendEmail: require('./handlers/send-email.js'),
  },
  dependencies
);

export { cpfExport };
