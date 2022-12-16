const { injectDependencies } = require('../../utils/dependency-injection');

const dependencies = {
  cpfCertificationResultRepository: require('../../repositories/cpf-certification-result-repository'),
  cpfCertificationXmlExportService: require('../../../domain/services/cpf-certification-xml-export-service'),
  cpfExternalStorage: require('../../external-storage/cpf-external-storage'),
  mailService: require('../../../domain/services/mail-service'),
};

module.exports = injectDependencies(
  {
    planner: require('./handlers/planner'),
    createAndUpload: require('./handlers/create-and-upload'),
    sendEmail: require('./handlers/send-email'),
  },
  dependencies
);
