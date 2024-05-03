import { getPreSignedUrls } from '../../../../src/certification/session-management/domain/usecases/get-cpf-presigned-urls.js';
import { uploadCpfFiles } from '../../../../src/certification/session-management/domain/usecases/upload-cpf-files.js';
import * as cpfCertificationResultRepository from '../../../../src/certification/session-management/infrastructure/repositories/cpf-certification-result-repository.js';
import * as cpfExportRepository from '../../../../src/certification/session-management/infrastructure/repositories/cpf-export-repository.js';
import { cpfExportsStorage } from '../../../../src/certification/session-management/infrastructure/storage/cpf-exports-storage.js';
import { injectDependencies } from '../../../../src/shared/infrastructure/utils/dependency-injection.js';
import * as cpfCertificationXmlExportService from '../../../domain/services/cpf-certification-xml-export-service.js';
import * as mailService from '../../../domain/services/mail-service.js';
import { createAndUpload } from './handlers/create-and-upload.js';
import { planner } from './handlers/planner.js';
import { sendEmail } from './handlers/send-email.js';

const usecases = injectDependencies(
  {
    uploadCpfFiles,
    getPreSignedUrls,
  },
  {
    cpfExportsStorage,
    cpfExportRepository,
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
