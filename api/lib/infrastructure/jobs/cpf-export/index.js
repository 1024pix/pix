import { injectDependencies } from '../../utils/dependency-injection';
import cpfCertificationResultRepository from '../../repositories/cpf-certification-result-repository';
import cpfCertificationXmlExportService from '../../../domain/services/cpf-certification-xml-export-service';
import cpfExternalStorage from '../../external-storage/cpf-external-storage';
import mailService from '../../../domain/services/mail-service';

const dependencies = {
  cpfCertificationResultRepository,
  cpfCertificationXmlExportService,
  cpfExternalStorage,
  mailService,
};

import planner from './handlers/planner';
import createAndUpload from './handlers/create-and-upload';
import sendEmail from './handlers/send-email';

export default injectDependencies(
  {
    planner,
    createAndUpload,
    sendEmail,
  },
  dependencies
);
