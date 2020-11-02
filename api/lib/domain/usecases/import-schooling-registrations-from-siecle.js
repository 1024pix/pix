const { FileValidationError, SameNationalStudentIdInOrganizationError, SameNationalStudentIdInFileError } = require('../errors');
const _ = require('lodash');
const SchoolingRegistrationParser = require('../../infrastructure/serializers/csv/schooling-registration-parser');

module.exports = async function importSchoolingRegistrationsFromSIECLE({ organizationId, buffer, format, organizationRepository, schoolingRegistrationsXmlService, schoolingRegistrationRepository }) {
  let schoolingRegistrationData = [];
  
  const organization = await organizationRepository.get(organizationId);
  const hasApprentice = organization.isAgriculture;

  if (format === 'xml') {
    const { UAIFromSIECLE, resultFromExtraction } = schoolingRegistrationsXmlService.extractSchoolingRegistrationsInformationFromSIECLE(buffer);
    
    if (UAIFromSIECLE !== organization.externalId) {
      throw new FileValidationError('Aucun étudiant n’a été importé. L’import n’est pas possible car l’UAI du fichier SIECLE ne correspond pas à celui de votre établissement. En cas de difficulté, contactez support.pix.fr.');
    }
    schoolingRegistrationData = resultFromExtraction;
  } else if (format === 'csv') {
    const csvSiecleParser = new SchoolingRegistrationParser(buffer, organizationId, hasApprentice);
    schoolingRegistrationData = csvSiecleParser.parse().registrations;
  } else {
    throw new FileValidationError('Format de fichier non valide.');
  }

  if (_.isEmpty(schoolingRegistrationData)) {
    throw new FileValidationError('Aucune inscription d’élève n’a pu être importée depuis ce fichier. Vérifiez que le fichier est conforme.');
  }

  try {
    await schoolingRegistrationRepository.addOrUpdateOrganizationSchoolingRegistrations(schoolingRegistrationData, organizationId, hasApprentice);
  } catch (err) {
    if (err instanceof SameNationalStudentIdInOrganizationError) {
      throw new SameNationalStudentIdInFileError(err.nationalStudentId);
    }
    throw err;
  }
};
