const certificationCenterCreationValidator = require('../validators/certification-center-creation-validator');
const GrantedAccreditation = require('../../domain/models/GrantedAccreditation');

module.exports = async function saveCertificationCenter({
  certificationCenter,
  accreditations,
  certificationCenterRepository,
  grantedAccreditationRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenter);
  if (certificationCenter.id) {
    await grantedAccreditationRepository.deleteByCertificationCenterId(certificationCenter.id);
  }
  if (accreditations) {
    await Promise.all(
      accreditations.map((accreditation) => {
        const grantedAccreditationModel = new GrantedAccreditation({
          accreditationId: accreditation.id,
          certificationCenterId: certificationCenter.id,
        });
        return grantedAccreditationRepository.save(grantedAccreditationModel);
      })
    );
  }

  return certificationCenterRepository.save(certificationCenter);
};
