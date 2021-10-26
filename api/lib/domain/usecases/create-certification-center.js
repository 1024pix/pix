const ComplementaryCertificationHabilitation = require('../models/ComplementaryCertificationHabilitation');
const certificationCenterCreationValidator = require('../validators/certification-center-creation-validator');

module.exports = async function createCertificationCenter({
  certificationCenter,
  accreditationIds,
  complementaryCertificationHabilitationRepository,
  certificationCenterRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenter);
  const createdCertificationCenter = await certificationCenterRepository.save(certificationCenter);

  for (const accreditationId of accreditationIds) {
    const complementaryCertificationHabilitation = new ComplementaryCertificationHabilitation({
      complementaryCertificationId: parseInt(accreditationId),
      certificationCenterId: createdCertificationCenter.id,
    });

    await complementaryCertificationHabilitationRepository.save(complementaryCertificationHabilitation);
  }

  return createdCertificationCenter;
};
