import { injectDependencies } from '../../../../src/shared/infrastructure/utils/dependency-injection.js';

import * as cpfCertificationResultRepository from '../../../../src/certification/session/infrastructure/repositories/cpf-certification-result-repository.js';
import * as cpfCertificationXmlExportService from '../../../domain/services/cpf-certification-xml-export-service.js';
import { cpfExportsStorage } from '../../../../src/certification/session/infrastructure/storage/cpf-exports-storage.js';
import { getPreSignedUrls } from '../../../../src/certification/session/domain/usecases/get-cpf-presigned-urls.js';
import { uploadCpfFiles } from '../../../../src/certification/session/domain/usecases/upload-cpf-files.js';
import * as mailService from '../../../domain/services/mail-service.js';

import { planner } from './handlers/planner.js';
import { createAndUpload } from './handlers/create-and-upload.js';
import { sendEmail } from './handlers/send-email.js';

const usecases = injectDependencies(
  {
    uploadCpfFiles,
    getPreSignedUrls,
  },
  {
    cpfExportsStorage,
  },
);

const dependencies = {
  cpfCertificationResultRepository,
  cpfCertificationXmlExportService,
  mailService,
  uploadCpfFiles: usecases.uploadCpfFiles,
  getPreSignedUrls: usecases.getPreSignedUrls,
};

const cpfExport = injectDependencies(
  {
    planner,
    createAndUpload,
    sendEmail,
  },
  dependencies,
);

export { cpfExport };
