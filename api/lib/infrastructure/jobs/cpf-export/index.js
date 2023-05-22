import { injectDependencies } from '../../utils/dependency-injection.js';

import * as cpfCertificationResultRepository from '../../repositories/cpf-certification-result-repository.js';
import * as cpfCertificationXmlExportService from '../../../domain/services/cpf-certification-xml-export-service.js';
import * as cpfExternalStorage from '../../external-storage/cpf-external-storage.js';
import * as mailService from '../../../domain/services/mail-service.js';

import * as planner from './handlers/planner.js';
import * as createAndUpload from './handlers/create-and-upload.js';
import * as sendEmail from './handlers/send-email.js';

const dependencies = {
  cpfCertificationResultRepository,
  cpfCertificationXmlExportService,
  cpfExternalStorage,
  mailService,
};

const cpfExport = injectDependencies(
  {
    planner,
    createAndUpload,
    sendEmail,
  },
  dependencies
);

export { cpfExport };
