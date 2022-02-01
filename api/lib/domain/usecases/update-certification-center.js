const certificationCenterCreationValidator = require('../validators/certification-center-creation-validator');
const ComplementaryCertificationHabilitation = require('../../domain/models/ComplementaryCertificationHabilitation');

module.exports = async function updateCertificationCenter({
  certificationCenter,
  complementaryCertificationIds,
  certificationCenterRepository,
  complementaryCertificationHabilitationRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenter);
  if (certificationCenter.id) {
    await complementaryCertificationHabilitationRepository.deleteByCertificationCenterId(certificationCenter.id);
  }
  if (complementaryCertificationIds) {
    await Promise.all(
      complementaryCertificationIds.map((complementaryCertificationId) => {
        const complementaryCertificationHabilitation = new ComplementaryCertificationHabilitation({
          complementaryCertificationId: parseInt(complementaryCertificationId),
          certificationCenterId: certificationCenter.id,
        });
        return complementaryCertificationHabilitationRepository.save(complementaryCertificationHabilitation);
      })
    );
  }

  return certificationCenterRepository.save(certificationCenter);
};
