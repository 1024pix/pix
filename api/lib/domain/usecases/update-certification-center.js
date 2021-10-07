const certificationCenterCreationValidator = require('../validators/certification-center-creation-validator');
const GrantedAccreditation = require('../../domain/models/GrantedAccreditation');

module.exports = async function updateCertificationCenter({
  certificationCenter,
  accreditationIds,
  certificationCenterRepository,
  grantedAccreditationRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenter);
  if (certificationCenter.id) {
    await grantedAccreditationRepository.deleteByCertificationCenterId(certificationCenter.id);
  }
  if (accreditationIds) {
    await Promise.all(
      accreditationIds.map((accreditationId) => {
        const grantedAccreditationModel = new GrantedAccreditation({
          accreditationId: parseInt(accreditationId),
          certificationCenterId: certificationCenter.id,
        });
        return grantedAccreditationRepository.save(grantedAccreditationModel);
      })
    );
  }

  return certificationCenterRepository.save(certificationCenter);
};
