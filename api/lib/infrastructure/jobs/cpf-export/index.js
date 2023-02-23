const { injectDependencies } = require('../../utils/dependency-injection.js');

const cpfCertificationResultRepository = require('../../repositories/cpf-certification-result-repository.js');
const cpfCertificationXmlExportService = require('../../../domain/services/cpf-certification-xml-export-service.js');
const cpfExternalStorage = require('../../external-storage/cpf-external-storage.js');
const mailService = require('../../../domain/services/mail-service.js');

const dependencies = {
  cpfCertificationResultRepository,
  cpfCertificationXmlExportService,
  cpfExternalStorage,
  mailService,
};

module.exports = injectDependencies(
  {
    planner: require('./handlers/planner.js'),
    createAndUpload: require('./handlers/create-and-upload.js'),
    sendEmail: require('./handlers/send-email.js'),
  },
  dependencies
);
