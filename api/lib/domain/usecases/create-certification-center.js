const certificationCenterCreationValidator = require('../validators/certification-center-creation-validator');

module.exports = function createCertificationCenter({ certificationCenter, certificationCenterRepository }) {
  certificationCenterCreationValidator.validate(certificationCenter);
  return certificationCenterRepository.save(certificationCenter);
};
