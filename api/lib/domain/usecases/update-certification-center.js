const certificationCenterCreationValidator = require('../validators/certification-center-creation-validator');
const ComplementaryCertificationHabilitation = require('../../domain/models/ComplementaryCertificationHabilitation');

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
        const complementaryCertificationHabilitation = new ComplementaryCertificationHabilitation({
          complementaryCertificationId: parseInt(accreditationId),
          certificationCenterId: certificationCenter.id,
        });
        return complementaryCertificationHabilitationRepository.save(complementaryCertificationHabilitation);
      })
    );
  }

  return certificationCenterRepository.save(certificationCenter);
};
