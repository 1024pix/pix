const { injectDependencies } = require('../../utils/dependency-injection');

const dependencies = {
  cpfCertificationResultRepository: require('../../repositories/cpf-certification-result-repository'),
  cpfCertificationXmlExportService: require('../../../domain/services/cpf-certification-xml-export-service'),
  cpfExternalStorage: require('../../external-storage/cpf-external-storage'),
};

module.exports = injectDependencies(
  {
    planner: require('./handlers/planner'),
    createAndUpload: require('./handlers/create-and-upload'),
  },
  dependencies
);
