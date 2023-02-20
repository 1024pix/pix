import { injectDependencies } from '../../utils/dependency-injection';

const dependencies = {
  cpfCertificationResultRepository: require('../../repositories/cpf-certification-result-repository'),
  cpfCertificationXmlExportService: require('../../../domain/services/cpf-certification-xml-export-service'),
  cpfExternalStorage: require('../../external-storage/cpf-external-storage'),
  mailService: require('../../../domain/services/mail-service'),
};

export default injectDependencies(
  {
    planner: require('./handlers/planner'),
    createAndUpload: require('./handlers/create-and-upload'),
    sendEmail: require('./handlers/send-email'),
  },
  dependencies
);
