const { injectDependencies } = require('../../utils/dependency-injection');

const cpfCertificationResultRepository = require('../../repositories/cpf-certification-result-repository');
const cpfCertificationXmlExportService = require('../../../domain/services/cpf-certification-xml-export-service');
const cpfExternalStorage = require('../../external-storage/cpf-external-storage');
const mailService = require('../../../domain/services/mail-service');

const dependencies = {
  cpfCertificationResultRepository,
  cpfCertificationXmlExportService,
  cpfExternalStorage,
  mailService,
};

module.exports = injectDependencies(
  {
    planner: require('./handlers/planner'),
    createAndUpload: require('./handlers/create-and-upload'),
    sendEmail: require('./handlers/send-email'),
  },
  dependencies
);
