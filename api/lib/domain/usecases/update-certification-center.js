const certificationCenterCreationValidator = require('../validators/certification-center-creation-validator');
const GrantedAccreditation = require('../../domain/models/GrantedAccreditation');

module.exports = async function updateCertificationCenter({
  certificationCenter,
  accreditationIds,
  certificationCenterRepository,
  complementaryCertificationHabilitationRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenter);
  if (certificationCenter.id) {
    await complementaryCertificationHabilitationRepository.deleteByCertificationCenterId(certificationCenter.id);
  }
  if (accreditationIds) {
    await Promise.all(
      accreditationIds.map((accreditationId) => {
        const grantedAccreditationModel = new GrantedAccreditation({
          accreditationId: parseInt(accreditationId),
          certificationCenterId: certificationCenter.id,
        });
        return complementaryCertificationHabilitationRepository.save(grantedAccreditationModel);
      })
    );
  }

  return certificationCenterRepository.save(certificationCenter);
};
