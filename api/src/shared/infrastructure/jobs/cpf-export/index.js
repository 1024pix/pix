import * as cpfCertificationXmlExportService from '../../../../../lib/domain/services/cpf-certification-xml-export-service.js';
import { uploadCpfFiles } from '../../../../certification/session-management/domain/usecases/upload-cpf-files.js';
import * as cpfCertificationResultRepository from '../../../../certification/session-management/infrastructure/repositories/cpf-certification-result-repository.js';
import * as cpfExportRepository from '../../../../certification/session-management/infrastructure/repositories/cpf-export-repository.js';
import { cpfExportsStorage } from '../../../../certification/session-management/infrastructure/storage/cpf-exports-storage.js';
import { injectDependencies } from '../../utils/dependency-injection.js';
import { createAndUpload } from './handlers/create-and-upload.js';
import { planner } from './handlers/planner.js';

const usecases = injectDependencies(
  {
    uploadCpfFiles,
  },
  {
    cpfExportsStorage,
    cpfExportRepository,
  },
);

const dependencies = {
  cpfCertificationResultRepository,
  cpfCertificationXmlExportService,
  uploadCpfFiles: usecases.uploadCpfFiles,
};

const cpfExport = injectDependencies(
  {
    planner,
    createAndUpload,
  },
  dependencies,
);

export { cpfExport };
